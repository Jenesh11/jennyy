'use client';

import { useState } from 'react';
import styles from './LoginModal.module.css';
import { sendOtp, verifyOtp, loginWithPhone, loginWithGoogle } from '@/lib/medusa';
import { useAuth } from '@/context/AuthContext';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
    const { refreshUser } = useAuth();
    const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (phone.length < 10) {
            setError('Please enter a valid phone number');
            return;
        }

        setIsLoading(true);
        try {
            await sendOtp(phone);
            setStep('OTP');
        } catch (err) {
            setError('Failed to send OTP. Please try again.');
        }
        setIsLoading(false);
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (otp.length < 4) {
            setError('Please enter the 4-digit code');
            return;
        }

        setIsLoading(true);
        try {
            // 1. Verify OTP
            await verifyOtp(phone, otp);

            // 2. Login/Register
            await loginWithPhone(phone);

            // 3. Update Auth Context
            await refreshUser();

            // 4. Close & Success
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Verification failed. Please check OTP.');
        }
        setIsLoading(false);
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError('');
        try {
            await loginWithGoogle();
            await refreshUser();
            onSuccess();
            onClose();
        } catch (err) {
            setError('Google login failed. Please try again.');
        }
        setIsLoading(false);
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <button className={styles.closeBtn} onClick={onClose}>&times;</button>

                <h2 className={styles.title}>
                    Welcome to Jennyy
                </h2>

                <p className={styles.subtitle}>
                    Login to access your orders and wishlist
                </p>

                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.googleContainer}>
                    <button
                        className={styles.googleBtn}
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                    >
                        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fillRule="evenodd" fillOpacity="1" fill="#4285f4" stroke="none"></path>
                            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.836.86-3.048.86-2.344 0-4.328-1.584-5.036-3.715h-3.007v2.332A8.997 8.997 0 0 0 9 18z" fillRule="evenodd" fillOpacity="1" fill="#34a853" stroke="none"></path>
                            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fillRule="evenodd" fillOpacity="1" fill="#fbbc05" stroke="none"></path>
                            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.159 6.656 3.58 9 3.58z" fillRule="evenodd" fillOpacity="1" fill="#ea4335" stroke="none"></path>
                        </svg>
                        <span>Continue with Google</span>
                    </button>
                </div>

                <p className={styles.terms}>
                    By continuing, you agree to our Terms of Use and Privacy Policy.
                </p>
            </div>
        </div>
    );
}
