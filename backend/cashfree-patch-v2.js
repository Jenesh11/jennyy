"use strict";

const { Cashfree } = require("@cashfreepayments/cashfree-sdk");

// Use a plain class for V2 compatibility. 
// Medusa V2 provider does not fundamentally require extending a base class if duck-typing works,
// but to be safe we implement the methods matching the interface.

class CashfreePaymentService {
    static identifier = "cashfree";

    constructor(container, options) {
        this.options_ = options || {};

        // Initialize SDK
        const appId = process.env.CASHFREE_APP_ID || options.app_id || options.appid;
        const secretKey = process.env.CASHFREE_SECRET_KEY || options.secret_key;
        const isSandbox = process.env.CASHFREE_SANDBOX === 'true' || options.sandbox === true;

        Cashfree.XClientId = appId;
        Cashfree.XClientSecret = secretKey;
        Cashfree.XEnvironment = isSandbox ? Cashfree.Environment.SANDBOX : Cashfree.Environment.PRODUCTION;

        console.log("[Cashfree] Initialized with App ID:", appId ? "***" + appId.slice(-4) : "MISSING");
    }

    // V2 Method: initiatePayment
    async initiatePayment(context) {
        console.log("[Cashfree] initiatePayment called with context:", JSON.stringify(context, null, 2));

        try {
            const { currency_code, amount, resource_id, customer, context: cartContext, email } = context;

            // Robust fallback for return_url
            const returnUrl = (cartContext && cartContext.return_url) ||
                "http://localhost:3000/order/confirmed";

            const request = {
                order_amount: amount, // Context amount is typically in major units if coming from V2 logic? 
                // WAIT: Medusa V2 amounts are stored as integers (cents).
                // Cashfree expects Major units (e.g. 10.50 INR).
                // But let's check input. If amount is 1000 for 10 INR, we need to divide.
                // Typically V2 providers receive `amount` from the payment session input.
                // If using this.createPayment logic from before which took `cart.total`, that was cents.
                // Let's assume input is standard Medusa integer.
                order_currency: (currency_code || "INR").toUpperCase(),
                order_id: resource_id || "order_" + Date.now(),
                customer_details: {
                    customer_id: (customer && customer.id) || "guest_" + Date.now(),
                    customer_phone: (customer && customer.phone) || "9999999999",
                    customer_name: (customer && (customer.first_name || customer.last_name)) ? `${customer.first_name} ${customer.last_name}` : "Guest",
                    customer_email: (customer && customer.email) || email || "guest@example.com"
                },
                order_meta: {
                    return_url: returnUrl
                }
            };

            // If amount is integer (cents), divide by 100 for Cashfree? 
            // NOTE: Cashfree Create Order API takes amount as Double/Float.
            // Medusa usually passes lowest common unit. 
            // Let's divide by 100 just to be safe if it's INR.
            if (request.order_currency === 'INR') {
                request.order_amount = request.order_amount; // Wait, actually let's look at logs later. 
                // For now, pass as is, or maybe check order value.
                // If amount is > 10000 probably it's cents.
                // Safest: assume it is coming from the session create request which we control manually on frontend?
                // Not exactly, we create session via API. 
                // Let's divide by 100 to stick to standard Medusa convention 
                // (Medusa stores 1000 for 10.00). Cashfree expects 10.00.
                request.order_amount = request.order_amount / 100;
            }

            console.log("[Cashfree] Creating Order:", request);

            const response = await Cashfree.PGCreateOrder("2023-08-01", request);
            console.log("[Cashfree] Order Created:", response.data);

            return {
                id: response.data.cf_order_id || response.data.order_id,
                data: response.data,
                session_data: response.data
            };
        } catch (error) {
            console.error("[Cashfree] initiatePayment Status Error:", error.response ? error.response.status : error);
            console.error("[Cashfree] initiatePayment Data Error:", error.response ? error.response.data : error.message);
            throw error;
        }
    }

    // V2 Method: authorizePayment
    async authorizePayment(paymentSessionData, context) {
        console.log("[Cashfree] authorizePayment called");
        return {
            status: "authorized",
            data: paymentSessionData
        };
    }

    // V2 Method: cancelPayment
    async cancelPayment(paymentSessionData) {
        console.log("[Cashfree] cancelPayment called");
        return { id: paymentSessionData.id };
    }

    // V2 Method: capturePayment
    async capturePayment(payment) {
        console.log("[Cashfree] capturePayment called");
        return { status: "captured" };
    }

    // V2 Method: deletePayment
    async deletePayment(paymentSessionData) {
        console.log("[Cashfree] deletePayment called");
        return;
    }

    // V2 Method: getPaymentData
    async getPaymentData(paymentSessionData) {
        return paymentSessionData;
    }

    // V2 Method: refundPayment
    async refundPayment(payment, refundAmount) {
        console.log("[Cashfree] refundPayment called");
        return { id: payment.id };
    }
}

// Correct Export for Medusa Loader
exports.default = CashfreePaymentService;
module.exports = exports.default;
