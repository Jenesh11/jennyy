'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';

export default function CartPage() {
    const router = useRouter();
    const { cart, isLoading, updateItem, removeItem, isLoading: isUpdating } = useCart();
    const [pincode, setPincode] = useState('110001');
    const [isEditingPincode, setIsEditingPincode] = useState(false);
    const [tempPincode, setTempPincode] = useState('');

    const { user, openLoginModal } = useAuth();

    const handleCheckout = () => {
        router.push('/checkout');
    };

    const handlePincodeSave = () => {
        if (tempPincode.length === 6) {
            setPincode(tempPincode);
            setIsEditingPincode(false);
        } else {
            alert('Please enter a valid 6-digit pincode');
        }
    };

    if (isLoading && !cart) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Loading your cart...</p>
            </div>
        );
    }

    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div className={`container ${styles.emptyContainer}`}>
                <h1 className={styles.pageTitle}>Your Cart is Empty</h1>
                <p className={styles.emptyText}>
                    Looks like you haven't added anything to your cart yet.
                </p>
                <Link href="/" className="btn btn-primary">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    const currencyCode = cart.region?.currency_code?.toUpperCase() || 'INR';

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currencyCode,
        }).format(amount / 100);
    };

    // Calculate totals mock (assuming Medusa might not calculate all these fees yet)
    // We will use real Subtotal.
    const platformFee = 1000; // 10 INR
    const shippingFee = 9900; // 99 INR
    const totalToPay = (cart.total || cart.subtotal || 0) + platformFee + shippingFee;

    return (
        <div className="container py-3xl">
            <h1 className={styles.pageTitle}>{cart.items.length} Product{cart.items.length !== 1 && 's'}</h1>

            <div className={styles.cartGrid}>
                {/* Left Column: Cart Items */}
                <div className={styles.itemsList}>
                    {cart.items.map((item: any) => (
                        <div key={item.id} className={styles.itemCard}>
                            <div className={styles.itemMain}>
                                {/* Image */}
                                <div className={styles.thumbnailWrapper}>
                                    {item.thumbnail ? (
                                        <Image
                                            src={item.thumbnail}
                                            alt={item.title}
                                            fill
                                            className={styles.thumbnail}
                                            sizes="120px"
                                        />
                                    ) : (
                                        <div className={styles.placeholder}></div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className={styles.itemDetails}>
                                    <h3 className={styles.itemTitle}>{item.title}</h3>

                                    <div className={styles.priceRow}>
                                        <span className={styles.mrp}>₹{((item.unit_price * 1.2) / 100).toFixed(0)}</span> {/* Mock MRP */}
                                        <span className={styles.sellingPrice}>{formatPrice(item.unit_price)}</span>
                                        <span className={styles.savings}>₹{((item.unit_price * 0.2) / 100).toFixed(0)} saved</span>
                                    </div>

                                    <div className={styles.variantRow}>
                                        {(() => {
                                            // 1. Prefer Metadata (Explicit Keys: "Size: M")
                                            if (item.metadata && Object.keys(item.metadata).length > 0) {
                                                return Object.entries(item.metadata).map(([key, value]: [string, any]) => (
                                                    <span key={key} className={styles.variantTag}>
                                                        {key}: {value}{' '}
                                                    </span>
                                                ));
                                            }

                                            // 2. Fallback to Variant Options (Medusa Standard: "M", "Black")
                                            if (item.variant?.options?.length > 0) {
                                                return item.variant.options.map((opt: any, index: number) => (
                                                    <span key={index} className={styles.variantTag}>
                                                        {opt.value}
                                                        {index < item.variant.options.length - 1 && ', '}
                                                    </span>
                                                ));
                                            }

                                            // 3. Fallback to Variant Title (e.g. "S / Black")
                                            if (item.variant?.title && item.variant.title !== item.title) {
                                                return <span className={styles.variantTag}>{item.variant.title}</span>;
                                            }

                                            // 4. Last Resort: Item Description or generic text
                                            return <span className={styles.variantTag}>{item.description}</span>;
                                        })()}
                                    </div>

                                    <div className={styles.returnPolicy}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                            <circle cx="12" cy="10" r="3"></circle>
                                        </svg>
                                        <span>No return policy (All sales final)</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Row: Delivery | Qty | Actions */}
                            <div className={styles.itemFooter}>
                                <div className={styles.deliveryInfo}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="1" y="3" width="15" height="13"></rect>
                                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                                        <circle cx="5.5" cy="18.5" r="2.5"></circle>
                                        <circle cx="18.5" cy="18.5" r="2.5"></circle>
                                    </svg>
                                    <span>Delivery in 6-8 days</span>
                                </div>

                                <div className={styles.qtyWrapper}>
                                    <label>Qty:</label>
                                    <select
                                        value={item.quantity}
                                        onChange={(e) => updateItem(item.id, parseInt(e.target.value))}
                                        disabled={isUpdating}
                                        className={styles.qtySelect}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(nu => (
                                            <option key={nu} value={nu}>{nu}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Actions Divider */}
                            <div className={styles.actionsDivider}>
                                <button
                                    className={styles.actionBtn}
                                    onClick={() => removeItem(item.id)}
                                    disabled={isUpdating}
                                >
                                    Remove
                                </button>
                                <div className={styles.verticalLine}></div>
                                <button className={styles.actionBtn}>
                                    Move to favourites
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Column: Price Summary */}
                <div className={styles.summaryColumn}>
                    <div className={styles.summaryCard}>
                        {/* Pincode Header */}
                        <div className={styles.deliveryHeader}>
                            {!isEditingPincode ? (
                                <>
                                    <div className={styles.deliveryText}>
                                        <span className={styles.deliveryLabel}>Delivering to</span>
                                        <span className={styles.pincode}>{pincode}</span>
                                    </div>
                                    <button
                                        className={styles.changeBtn}
                                        onClick={() => {
                                            setTempPincode(pincode);
                                            setIsEditingPincode(true);
                                        }}
                                    >
                                        Change
                                    </button>
                                </>
                            ) : (
                                <div className={styles.pincodeEdit}>
                                    <input
                                        type="text"
                                        value={tempPincode}
                                        onChange={(e) => setTempPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className={styles.pincodeInput}
                                        placeholder="Pincode"
                                        autoFocus
                                    />
                                    <div className={styles.pincodeActions}>
                                        <button className={styles.saveBtn} onClick={handlePincodeSave}>Save</button>
                                        <button className={styles.cancelBtn} onClick={() => setIsEditingPincode(false)}>Cancel</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={styles.summaryRows}>
                            <div className={styles.summaryRow}>
                                <span>Total MRP</span>
                                <span>{formatPrice(cart.subtotal * 1.2)}</span>
                            </div>
                            <div className={`${styles.summaryRow} ${styles.discountRow}`}>
                                <span>Offer discount</span>
                                <span>-{formatPrice(cart.subtotal * 0.2)}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Shipping fee</span>
                                <span>{formatPrice(shippingFee)}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Platform fee <span className={styles.infoIcon}>ⓘ</span></span>
                                <span>{formatPrice(platformFee)}</span>
                            </div>
                        </div>

                        <div className={styles.totalRow}>
                            <span className={styles.totalLabel}>Total</span>
                            <span className={styles.totalValue}>{formatPrice(totalToPay)}</span>
                        </div>

                        <button className={styles.checkoutBtn} onClick={handleCheckout}>
                            CHECKOUT NOW
                        </button>
                    </div>

                    <div className={styles.trustBadge}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        Safe and Secure Payments. 100% Authentic products.
                    </div>
                </div>
            </div>
        </div>
    );
}
