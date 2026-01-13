import Medusa from "@medusajs/js-sdk";

// Initialize Medusa client
export const medusa = new Medusa({
    baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000",
    debug: process.env.NODE_ENV === "development",
    publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
});

// Helper functions for common operations
export const getRegions = async () => {
    try {
        const response = await medusa.store.region.list();
        return response.regions || [];
    } catch (error) {
        console.error("Error fetching regions:", error);
        return [];
    }
};

const getDefaultRegion = async () => {
    const regions = await getRegions();
    return regions[0]?.id;
};

export const getProducts = async (params: any = {}) => {
    try {
        const regionId = await getDefaultRegion();
        // Use simple list with region_id which is known to work for visibility
        const response = await medusa.store.product.list({
            ...params,
            region_id: regionId,
        });
        return response.products || [];
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
};

export const getProduct = async (id: string) => {
    try {
        const regionId = await getDefaultRegion();
        const response = await medusa.store.product.retrieve(id, {
            region_id: regionId,
            fields: "+variants.metadata"
        });
        return response.product;
    } catch (error) {
        console.error("Error fetching product:", error);
        return null;
    }
};

export const getCollections = async () => {
    try {
        const response = await medusa.store.collection.list();
        return response.collections || [];
    } catch (error) {
        console.error("Error fetching collections:", error);
        return [];
    }
};

export const getCollectionByHandle = async (handle: string) => {
    try {
        const response = await medusa.store.collection.list({ handle: [handle] });
        return response.collections[0] || null;
    } catch (error) {
        console.error("Error fetching collection:", error);
        return null;
    }
};
// Cart functions
export const createCart = async () => {
    try {
        const regionId = await getDefaultRegion();
        const response = await medusa.store.cart.create({
            region_id: regionId
        });
        return response.cart;
    } catch (error) {
        console.error("Error creating cart:", error);
        return null;
    }
};

export const getCart = async (cartId: string) => {
    try {
        const response = await medusa.store.cart.retrieve(cartId);
        return response.cart;
    } catch (error) {
        console.error("Error fetching cart:", error);
        return null;
    }
};

export const addItem = async (cartId: string, variantId: string, quantity: number, metadata?: Record<string, any>) => {
    try {
        const response = await medusa.store.cart.createLineItem(cartId, {
            variant_id: variantId,
            quantity: quantity,
            metadata: metadata
        });
        return response.cart;
    } catch (error) {
        console.error("Error adding item to cart:", error);
        throw error;
    }
};

export const updateLineItem = async (cartId: string, lineId: string, quantity: number) => {
    try {
        await medusa.store.cart.updateLineItem(cartId, lineId, {
            quantity: quantity
        });
        // Refetch cart to ensure we have the full updated state including totals
        return await getCart(cartId);
    } catch (error) {
        console.error("Error updating line item:", error);
        throw error;
    }
};

// Checkout functions
export const updateCart = async (cartId: string, data: any) => {
    try {
        const response = await medusa.store.cart.update(cartId, data);
        return response.cart;
    } catch (error) {
        console.error("Error updating cart:", error);
        throw error;
    }
};

export const addShippingMethod = async (cartId: string, optionId: string) => {
    try {
        const response = await medusa.store.cart.addShippingMethod(cartId, {
            option_id: optionId
        });
        return response.cart;
    } catch (error) {
        console.error("Error adding shipping method:", error);
        throw error;
    }
};

export const getShippingOptions = async (cartId: string) => {
    try {
        const response = await (medusa.store as any).shippingOption.list({
            cart_id: cartId
        });
        return response.shipping_options;
    } catch (error) {
        console.error("Error fetching shipping options:", error);
        return [];
    }
};

export const completeCart = async (cartId: string) => {
    try {
        const response = await medusa.store.cart.complete(cartId);
        return response.data; // Returns order object or cart if not complete
    } catch (error) {
        console.error("Error completing cart:", error);
        throw error;
    }
};

// Manual V2 Payment Flow implementation to bypass SDK ambiguity
export const createPaymentSessions = async (cartId: string) => {
    try {
        console.log("Initializing Payment Collection for Cart:", cartId);
        // 1. Create Payment Collection
        const { payment_collection } = await storeRequest('/payment-collections', 'POST', {
            cart_id: cartId
            // currency_code removed as it causes "Unrecognized field" error. Cart has currency.
        });

        if (!payment_collection) {
            throw new Error("Failed to create payment collection");
        }

        // 2. Initiate Payment Session for Cashfree
        const { payment_collection: updatedCollection } = await storeRequest(`/payment-collections/${payment_collection.id}/payment-sessions`, 'POST', {
            provider_id: "cashfree"
        });

        // 3. Return the Cart (freshly fetched to include the new payment session data if linked)
        // Note: Payment Collections are separate from Carts in V2 response structure often, 
        // but the Cart object usually has a 'payment_collection' relation or similar.
        // For the frontend to see 'payment_sessions', we might need to map it or return the collection.
        // However, standard Medusa checkout often expects the cart to have the sessions.
        // In V2, we might need to rely on the payment_collection object.

        // Let's return the cart, but we might need to manually attach the session for our frontend logic to work.
        // Our frontend looks for 'cart.payment_sessions'.
        // Let's return a "Merged" object or just the cart and hope Medusa linked them.
        const cart = await getCart(cartId);

        // Polyfill/Hack: Attach the session from collection to cart.payment_sessions for frontend compatibility
        if (updatedCollection && updatedCollection.payment_sessions) {
            (cart as any).payment_sessions = updatedCollection.payment_sessions;
        }

        return cart;
    } catch (error) {
        console.error("Error initiating payment session:", error);
        return await getCart(cartId);
    }
};

export const setPaymentSession = async (cartId: string, providerId: string) => {
    try {
        // In V2, "setting" a session usually just means ensuring it exists in the collection.
        // We can just reuse the create logic or call the session init endpoint again.
        // For COD (manual), we might need a specific handling.

        // For now, re-use create logic as it's effectively "ensure session".
        return await createPaymentSessions(cartId);
    } catch (error) {
        console.error("Error setting payment session:", error);
        throw error;
    }
};

export const deleteLineItem = async (cartId: string, lineId: string) => {
    try {
        await medusa.store.cart.deleteLineItem(cartId, lineId);
        // Refetch cart to ensure we have the full updated state
        return await getCart(cartId);
    } catch (error) {
        console.error("Error deleting line item:", error);
        throw error;
    }
};

// --- Mock Auth Functions ---

// Mock OTP Database
const OTP_STORE: Record<string, string> = {};

export const sendOtp = async (phone: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    const otp = '1234'; // Fixed for now
    OTP_STORE[phone] = otp;
    console.log(`[Mock SMS] OTP for ${phone} is ${otp}`);
    return true;
};

export const verifyOtp = async (phone: string, code: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    // For demo, accept 1234 or the stored one
    if (code === '1234' || OTP_STORE[phone] === code) {
        return true;
    }
    throw new Error('Invalid OTP');
};

// Helper for direct API calls to bypass SDK typing issues for Auth
const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

async function storeRequest(path: string, method: string = 'GET', body?: any) {
    const options: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ? { 'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY } : {}),
            // Include credentials to handle cookie sessions (Medusa standard)
        }
    };

    // Note: Cookies are handled automatically by browser in same-origin or CORS with credentials
    // Next.js client component -> Backend is usually cross-origin in dev.
    // We need to ensure credentials are sent.
    options.credentials = 'include';

    if (body) {
        options.body = JSON.stringify(body);
    }

    const res = await fetch(`${BACKEND_URL}/store${path}`, options);
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || `Request failed: ${res.status}`);
    }
    return res.json();
}

export const loginWithPhone = async (phone: string) => {
    const email = `${phone}@jennyy.com`;
    const password = `pass_${phone}`; // Deterministic password

    try {
        // 1. Try Login
        const { customer } = await storeRequest('/auth', 'POST', {
            email,
            password
        });
        return customer;
    } catch (loginError) {
        // 2. If Login fails, try to Register
        try {
            console.log("Login failed, trying registration for", email);
            const { customer } = await storeRequest('/customers', 'POST', {
                email,
                password,
                first_name: 'Guest',
                last_name: 'User',
                phone
            });
            // 3. Register usually logs you in. If not, try login one more time or return customer.
            return customer;
        } catch (regError: any) {
            console.error("Registration failed:", regError);
            throw regError;
        }
    }
};

export const getCustomer = async () => {
    try {
        const { customer } = await storeRequest('/auth'); // GET /store/auth returns session
        return customer;
    } catch (error) {
        return null; // Not logged in
    }
};

export const loginWithGoogle = async () => {
    // Mock Google Login Flow
    await new Promise(resolve => setTimeout(resolve, 1500));

    const email = "google_user@gmail.com";
    const password = "google_mock_password";

    try {
        const { customer } = await storeRequest('/auth', 'POST', {
            email,
            password
        });
        return customer;
    } catch (loginError) {
        const { customer } = await storeRequest('/customers', 'POST', {
            email,
            password,
            first_name: 'Google',
            last_name: 'User',
            phone: '9999999999'
        });
        return customer;
    }
};

export const logout = async () => {
    try {
        await storeRequest('/auth', 'DELETE');
        return true;
    } catch (error) {
        console.error("Logout failed", error);
        return false;
    }
};
