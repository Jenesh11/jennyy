'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from './ProductCard.module.css';

interface ProductCardProps {
    product: {
        id: string;
        title: string;
        thumbnail?: string;
        variants?: Array<{
            calculated_price?: {
                calculated_amount?: number;
                currency_code?: string;
            };
            prices?: Array<{
                amount: number;
                currency_code: string;
            }>;
        }>;
    };
}

export default function ProductCard({ product }: ProductCardProps) {
    let price = product.variants?.[0]?.calculated_price?.calculated_amount;
    let currencyCode = product.variants?.[0]?.calculated_price?.currency_code || 'INR';

    // Fallback: If calculated_price is missing, try to find INR price in prices array
    if (price === undefined && product.variants?.[0]?.prices) {
        const inrPrice = product.variants[0].prices.find((p: any) => p.currency_code?.toLowerCase() === 'inr');
        if (inrPrice) {
            price = inrPrice.amount;
            currencyCode = inrPrice.currency_code;
        }
    }

    const formatPrice = (amount?: number) => {
        if (!amount && amount !== 0) return 'Price unavailable';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currencyCode.toUpperCase(),
        }).format(amount / 100);
    };

    return (
        <Link href={`/products/${product.id}`} className={styles.card}>
            <div className={styles.imageWrapper}>
                {product.thumbnail ? (
                    <Image
                        src={product.thumbnail}
                        alt={product.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className={styles.image}
                    />
                ) : (
                    <div className={styles.placeholder}>
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="2" />
                            <polyline points="21 15 16 10 5 21" strokeWidth="2" />
                        </svg>
                    </div>
                )}
                <button className={styles.quickAdd} aria-label="Quick add to cart">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                        <path d="M1 1h3l2.68 13.39a1 1 0 001 .78h9.72a1 1 0 001-.78L20 5H5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Quick Add
                </button>
            </div>
            <div className={styles.content}>
                <h3 className={styles.title}>{product.title}</h3>
                <p className={styles.price}>{formatPrice(price)}</p>
            </div>
        </Link>
    );
}
