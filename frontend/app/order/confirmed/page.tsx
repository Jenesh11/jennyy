'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useCart } from '@/context/CartContext';

export default function OrderConfirmedPage() {
    const { setCart } = useCart();

    useEffect(() => {
        // Clear cart on mount (assuming successful order)
        // In a real app, verify order status via API using query params
        setCart(null);
    }, [setCart]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '80vh',
            textAlign: 'center',
            padding: '2rem'
        }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Order Confirmed!</h1>
            <p style={{ color: '#666', marginBottom: '2rem', maxWidth: '500px' }}>
                Thank you for your purchase. Your order has been received and is being processed.
                You will receive an email confirmation shortly.
            </p>
            <Link href="/" style={{
                background: 'black',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '8px',
                textDecoration: 'none'
            }}>
                Continue Shopping
            </Link>
        </div>
    );
}
