'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Script from 'next/script'; // Import Next.js Script
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { updateCart, completeCart, createPaymentSessions, setPaymentSession } from '@/lib/medusa';
import styles from './page.module.css';

declare global {
    interface Window {
        Cashfree: any;
    }
}

export default function CheckoutPage() {
    const router = useRouter();
    const { cart, setCart, isLoading: isCartLoading } = useCart();
    const { user, isLoading: isAuthLoading } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        address: '',
        apartment: '',
        city: '',
        state: '',
        pincode: '',
        phone: ''
    });

    const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod' | 'cashfree'>('cashfree'); // Default to cashfree
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Redirect if cart is empty
    useEffect(() => {
        if (!isCartLoading) {
            if (!cart || !cart.items.length) {
                router.push('/');
            } else if (user) {
                setFormData(prev => ({
                    ...prev,
                    email: user.email,
                    phone: user.phone || '',
                    firstName: user.first_name || '',
                    lastName: user.last_name || ''
                }));
            }
        }
    }, [user, cart, isCartLoading, router]);

    if (isCartLoading || isAuthLoading || !cart) {
        return <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading Checkout...</div>;
    }

    // Calculations
    const cartSubtotal = (cart.total || cart.subtotal || 0) / 100;
    const isFreeShipping = cartSubtotal > 999;
    const shippingFee = isFreeShipping ? 0 : 99; // 99 INR flat fee
    const total = cartSubtotal + shippingFee;
    const isCodAvailable = total > 299;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePaymentChange = (method: 'online' | 'cod' | 'cashfree') => {
        if (method === 'cod' && !isCodAvailable) return;
        setPaymentMethod(method);
    };

    // Unified Submit Handler
    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevent form default
        setIsSubmitting(true);

        try {
            // 0. Validate Email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                throw new Error("Please enter a valid email address.");
            }

            // 1. Prepare Address Data
            const addressData = {
                first_name: formData.firstName,
                last_name: formData.lastName,
                address_1: formData.address,
                address_2: formData.apartment,
                city: formData.city,
                province: formData.state,
                postal_code: formData.pincode,
                phone: formData.phone,
                country_code: 'in'
            };

            // 2. Save Address First (Silent Update)
            console.log("Updating address...");
            // alert("Debug: Updating Address..."); // Too noisy? maybe just log
            let updatedCart = await updateCart(cart.id, {
                email: formData.email,
                shipping_address: addressData,
                billing_address: addressData
                // Context removed to avoid backend validation error
            });
            // alert("Debug: Address Updated!");

            // 3. Initialize/Refresh Payment Sessions
            // This ensures backend generates a payment intent (Cashfree order_token/payment_session)
            console.log("Creating payment sessions...");
            alert("Debug: Creating Payment Session..."); // User will see this if we get here
            updatedCart = await createPaymentSessions(cart.id);
            alert(`Debug: Sessions Created! Found: ${updatedCart.payment_sessions?.length}`);

            // 4. Select Payment Method
            if (paymentMethod === 'cod') {
                // For COD, usually 'manual' provider is used if configured, or specific COD provider
                // Assuming 'manual' for COD based on standard Medusa setup, or 'cod' if plugin exists.
                // We'll try setting 'manual' for now.
                await setPaymentSession(cart.id, 'manual');
                await completeCart(cart.id);
                alert("Order Placed Successfully via COD!");
                router.push('/');
            } else if (paymentMethod === 'cashfree') {
                // Select Cashfree provider
                await setPaymentSession(cart.id, 'cashfree');

                // Find the Cashfree session to get the payment_session_id
                const cashfreeSession = updatedCart.payment_sessions?.find((s: any) => s.provider_id === 'cashfree');

                if (!cashfreeSession) {
                    throw new Error("Cashfree payment session not found. Please try again.");
                }

                if (!window.Cashfree) {
                    throw new Error("Payment SDK failed to load. Please refresh the page.");
                }

                // Initialize Cashfree SDK
                const cashfree = new window.Cashfree({
                    mode: "sandbox" // Change to "production" when live
                });

                console.log("Launching Cashfree Checkout", cashfreeSession.data);

                // Trigger Checkout
                // The 'payment_session_id' from Medusa is exactly what the SDK needs
                cashfree.checkout({
                    paymentSessionId: cashfreeSession.data.payment_session_id,
                    redirectTarget: "_self" // Redirects the page
                });

                // Note: The user will be redirected away. 
                // Medusa will handle the callback/webhook to complete the order.
            }

        } catch (error: any) {
            console.error("Order failed:", error);
            setIsSubmitting(false); // Reset loading state on error
            alert(`Failed to place order: ${error.message || "Please check your details."}`);
        }
        // No finally block needed effectively if we handle reset in catch and success redirect
    };

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    };

    return (
        <div className={styles.container}>
            <Script src="https://sdk.cashfree.com/js/v3/cashfree.js" strategy="lazyOnload" />
            <form onSubmit={handlePlaceOrder} className={styles.layout}>

                {/* Left Column: Form */}
                <div className={styles.formSection}>

                    {/* Header */}
                    <div className={styles.brandHeader}>
                        <h2>Jennyy</h2>
                        <nav className={styles.breadcrumb}>
                            Cart &gt; Information &gt; Payment
                        </nav>
                    </div>

                    {/* 1. Contact Section */}
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h3 className={styles.sectionTitle}>Contact</h3>
                            {!user && (
                                <span className={styles.loginLink}>
                                    Have an account? <a href="#">Log in</a>
                                </span>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Email address"
                                className={styles.input}
                                required
                            />
                            <div className={styles.checkboxRow}>
                                <input type="checkbox" id="news" defaultChecked />
                                <label htmlFor="news">Email me with news and offers</label>
                            </div>
                        </div>
                    </div>

                    {/* 2. Delivery Section */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle} style={{ marginBottom: '1rem' }}>
                            Delivery
                        </h3>

                        <div className={styles.formGroup}>
                            <select className={styles.select} disabled>
                                <option>India</option>
                            </select>

                            <div className={styles.inputRow}>
                                <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="First name" className={styles.input} required />
                                <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Last name" className={styles.input} required />
                            </div>

                            <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Address" className={styles.input} required />
                            <input type="text" name="apartment" value={formData.apartment} onChange={handleInputChange} placeholder="Apartment, suite, etc. (optional)" className={styles.input} />

                            <div className={`${styles.inputRow} ${styles.threeCols}`}>
                                <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="City" className={styles.input} required />
                                <select name="state" value={formData.state} onChange={handleInputChange} className={styles.select} required>
                                    <option value="" disabled>State</option>
                                    <option value="Haryana">Haryana</option>
                                    <option value="Delhi">Delhi</option>
                                    <option value="Maharashtra">Maharashtra</option>
                                    <option value="Karnataka">Karnataka</option>
                                </select>
                                <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="PIN code" className={styles.input} required />
                            </div>

                            <div className={styles.phoneGroup}>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone" className={styles.input} required />
                                <span className={styles.flagIcon}>+91</span>
                            </div>

                            <div className={styles.checkboxRow}>
                                <input type="checkbox" id="saveInfo" />
                                <label htmlFor="saveInfo">Save this information for next time</label>
                            </div>
                        </div>
                    </div>

                    {/* 3. Shipping Method (Always Visible) */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle} style={{ marginBottom: '1rem' }}>Shipping method</h3>
                        <div className={styles.shippingMethodBox}>
                            <div className={styles.shippingInfo}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '0.5rem' }}>
                                    <span className={styles.shippingName}>Shipping Charges</span>
                                    <span className={styles.shippingPrice}>{isFreeShipping ? 'Free' : '₹99.00'}</span>
                                </div>
                                <div className={styles.shippingDescList}>
                                    <span>☑ For Prepaid Orders Only</span>
                                    <span>☑ Free Shipping on Orders above Rs. 999/-</span>
                                    <span>☑ COD on Orders above Rs. 299/-</span>
                                    <span>☑ Custom Orders are Prepaid Only.</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. Payment (Always Visible) */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle} style={{ marginBottom: '0.5rem' }}>Payment</h3>
                        <p className={styles.subtext}>All transactions are secure and encrypted.</p>

                        <div className={styles.paymentBox}>

                            {/* Option 1: Cashfree */}
                            <label className={`${styles.paymentOption} ${paymentMethod === 'cashfree' ? styles.selected : ''}`}>
                                <div className={styles.radioHeader}>
                                    <div className={styles.radioHeaderLeft}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            checked={paymentMethod === 'cashfree'}
                                            onChange={() => setPaymentMethod('cashfree')}
                                        />
                                        <span className={styles.paymentLabelText}>PhonePe Payment Gateway (UPI, Cards & NetBanking)</span>
                                    </div>
                                    <div className={styles.paymentIcons}>
                                        <span className={styles.payIcon}>UPI</span>
                                        <span className={styles.payIcon}>VISA</span>
                                        <span className={styles.payIcon}>Mastercard</span>
                                        <span className={styles.payIcon}>+4</span>
                                    </div>
                                </div>

                                {paymentMethod === 'cashfree' && (
                                    <div className={styles.paymentDetails}>
                                        <div className={styles.redirectVisual}>
                                            <div className={styles.windowIcon}>
                                                <div className={styles.dots}><span></span><span></span><span></span></div>
                                            </div>
                                            <span className={styles.arrowIcon}>➔</span>
                                        </div>
                                        <p style={{ marginTop: '1rem' }}>
                                            After clicking “Pay now”, you will be redirected to PhonPe Payment Gateway (UPI, Cards & NetBanking) to complete your purchase securely.
                                        </p>
                                    </div>
                                )}
                            </label>

                            {/* Option 2: COD */}
                            <label className={`${styles.paymentOption} ${paymentMethod === 'cod' ? styles.selected : ''} ${!isCodAvailable ? styles.disabled : ''}`}>
                                <div className={styles.radioHeader}>
                                    <div className={styles.radioHeaderLeft}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            checked={paymentMethod === 'cod'}
                                            onChange={() => setPaymentMethod('cod')}
                                            disabled={!isCodAvailable}
                                        />
                                        <span className={styles.paymentLabelText}>Cash on Delivery (COD)</span>
                                    </div>
                                </div>
                                {paymentMethod === 'cod' && (
                                    <div className={styles.paymentDetails}>
                                        <p>Pay with cash upon delivery.</p>
                                    </div>
                                )}
                                {!isCodAvailable && (
                                    <div className={styles.warningBox}>
                                        <span>⚠️</span>
                                        COD is only available for orders above ₹299.
                                    </div>
                                )}
                            </label>
                        </div>



                        <button type="submit" className={styles.primaryBtn} disabled={isSubmitting}>
                            {isSubmitting ? 'Processing...' : 'Pay now'}
                        </button>
                    </div>
                </div>

                {/* Right Column: Order Summary */}
                <div className={styles.summarySection}>
                    <div className={styles.itemsList}>
                        {cart.items.map((item: any) => (
                            <div key={item.id} className={styles.item}>
                                <div className={styles.itemImageWrapper}>
                                    <div className={styles.qtyBadge}>{item.quantity}</div>
                                    <Image src={item.thumbnail || '/placeholder.png'} alt={item.title} fill className={styles.itemImage} sizes="64px" />
                                </div>
                                <div className={styles.itemInfo}>
                                    <p className={styles.itemName}>{item.title}</p>
                                    <p className={styles.itemVariant}>{item.variant?.title !== item.title ? item.variant?.title : ''}</p>
                                </div>
                                <span className={styles.itemPrice}>{formatPrice(item.unit_price * item.quantity / 100)}</span>
                            </div>
                        ))}
                    </div>

                    <div className={styles.costRows}>
                        <div className={styles.row}>
                            <span>Subtotal</span>
                            <span>{formatPrice(cartSubtotal)}</span>
                        </div>
                        <div className={styles.row}>
                            <span>Shipping</span>
                            <span>{shippingFee === 0 ? 'Free' : formatPrice(shippingFee)}</span>
                        </div>
                    </div>

                    <div className={styles.totalRow}>
                        <span className={styles.totalLabel}>Total</span>
                        <div className={styles.totalValueWrapper}>
                            <span className={styles.currencyCode}>INR</span>
                            <span className={styles.totalValue}>{formatPrice(total)}</span>
                        </div>
                    </div>
                    {/* Tax inclusion note */}
                    <p style={{ fontSize: '0.8rem', color: '#737373', marginTop: '0.5rem' }}>Including ₹{formatPrice(total * 0.18)} in taxes</p>
                </div>
            </form>
        </div>
    );
}
