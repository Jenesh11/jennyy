'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCustomer, logout as medusaLogout } from '@/lib/medusa';

import LoginModal from '@/components/LoginModal';

interface AuthContextType {
    user: any;
    isLoading: boolean;
    refreshUser: () => Promise<void>;
    logout: () => Promise<void>;
    openLoginModal: () => void;
    closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const refreshUser = async () => {
        setIsLoading(true);
        const customer = await getCustomer();
        setUser(customer);
        setIsLoading(false);
    };

    const logout = async () => {
        setIsLoading(true);
        await medusaLogout();
        setUser(null);
        setIsLoading(false);
    };

    const openLoginModal = () => setIsModalOpen(true);
    const closeLoginModal = () => setIsModalOpen(false);

    useEffect(() => {
        refreshUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, refreshUser, logout, openLoginModal, closeLoginModal }}>
            {children}
            <LoginModal
                isOpen={isModalOpen}
                onClose={closeLoginModal}
                onSuccess={() => {
                    refreshUser();
                    // Optional: could redirect or show success toast here
                }}
            />
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
