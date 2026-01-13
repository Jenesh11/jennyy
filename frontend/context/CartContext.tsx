'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createCart, getCart, addItem, updateLineItem, deleteLineItem } from '@/lib/medusa';

interface CartContextType {
    cart: any;
    cartCount: number;
    addToCart: (variantId: string, quantity: number, metadata?: Record<string, any>) => Promise<void>;
    updateItem: (lineId: string, quantity: number) => Promise<void>;
    removeItem: (lineId: string) => Promise<void>;
    setCart: React.Dispatch<any>;
    isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const cartCount = cart?.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;

    const initCart = async () => {
        setIsLoading(true);
        const cartId = localStorage.getItem('cart_id');

        if (cartId) {
            const existingCart = await getCart(cartId);
            if (existingCart) {
                setCart(existingCart);
            } else {
                await createNewCart();
            }
        } else {
            await createNewCart();
        }
        setIsLoading(false);
    };

    const createNewCart = async () => {
        const newCart = await createCart();
        if (newCart) {
            setCart(newCart);
            localStorage.setItem('cart_id', newCart.id);
        }
    };

    useEffect(() => {
        initCart();
    }, []);

    const addToCart = async (variantId: string, quantity: number, metadata?: Record<string, any>) => {
        if (!cart?.id) {
            await createNewCart();
        }

        setIsLoading(true);
        // Re-check cart ID after potential creation
        const currentCartId = cart?.id || localStorage.getItem('cart_id');

        if (currentCartId) {
            try {
                const updatedCart = await addItem(currentCartId, variantId, quantity, metadata);
                setCart(updatedCart);
                alert("Product added to cart!");
            } catch (error) {
                console.error("Add to cart failed", error);
                alert("Failed to add to cart. Please try again.");
            }
        }
        setIsLoading(false);
    };

    const updateItem = async (lineId: string, quantity: number) => {
        if (!cart?.id) return;
        setIsLoading(true);
        try {
            const updatedCart = await updateLineItem(cart.id, lineId, quantity);
            setCart(updatedCart);
        } catch (error) {
            console.error("Update item failed", error);
        }
        setIsLoading(false);
    };

    const removeItem = async (lineId: string) => {
        if (!cart?.id) return;
        setIsLoading(true);
        try {
            const updatedCart = await deleteLineItem(cart.id, lineId);
            setCart(updatedCart);
        } catch (error) {
            console.error("Remove item failed", error);
        }
        setIsLoading(false);
    };

    return (
        <CartContext.Provider value={{ cart, cartCount, addToCart, updateItem, removeItem, setCart, isLoading }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
