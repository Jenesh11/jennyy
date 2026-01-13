'use client';

import { useState } from 'react';
import styles from './ProductInfoTabs.module.css';

interface ProductInfoTabsProps {
    description: string;
}

type TabType = 'description' | 'returns' | 'shipping';

export default function ProductInfoTabs({ description }: ProductInfoTabsProps) {
    const [activeTab, setActiveTab] = useState<TabType>('description');

    return (
        <div className={styles.container}>
            <div className={styles.tabsHeader}>
                <button
                    className={`${styles.tab} ${activeTab === 'description' ? styles.active : ''}`}
                    onClick={() => setActiveTab('description')}
                >
                    Description
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'returns' ? styles.active : ''}`}
                    onClick={() => setActiveTab('returns')}
                >
                    Return Policies
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'shipping' ? styles.active : ''}`}
                    onClick={() => setActiveTab('shipping')}
                >
                    Shipping Info
                </button>
            </div>

            <div className={styles.content}>
                {activeTab === 'description' && (
                    <div className={styles.tabContent}>
                        <p className={styles.text}>{description}</p>
                    </div>
                )}

                {activeTab === 'returns' && (
                    <div className={styles.tabContent}>
                        <h3 className={styles.heading}>Return & Refund Policy</h3>
                        <p className={styles.text}>
                            We do not have a return policy. All sales are final.
                            Please review your order carefully before confirming.
                        </p>
                        <p className={styles.text}>
                            In the unlikely event that you receive a damaged or incorrect item,
                            please contact our support team immediately for assistance.
                        </p>
                    </div>
                )}

                {activeTab === 'shipping' && (
                    <div className={styles.tabContent}>
                        <h3 className={styles.heading}>Shipping Information</h3>
                        <ul className={styles.list}>
                            <li>Standard delivery: 5-7 business days</li>
                            <li>Express delivery options available at checkout</li>
                            <li>Free shipping on orders above ₹1,000</li>
                            <li>Tracking number will be provided once shipped</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
