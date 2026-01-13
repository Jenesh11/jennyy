'use client';

import { useState } from 'react';
import styles from './PincodeChecker.module.css';

export default function PincodeChecker() {
    const [pincode, setPincode] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [location, setLocation] = useState('');

    const checkPincode = async () => {
        if (!/^\d{6}$/.test(pincode)) {
            setStatus('error');
            setMessage('Please enter a valid 6-digit pincode.');
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
            const data = await response.json();

            if (data && data[0].Status === 'Success') {
                const city = data[0].PostOffice[0].District;
                const state = data[0].PostOffice[0].State;
                setLocation(`${city}, ${state}`);
                setStatus('success');
            } else {
                setStatus('error');
                setMessage('Invalid pincode or service unavailable.');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Something went wrong. Please try again.');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13"></rect>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                    <circle cx="5.5" cy="18.5" r="2.5"></circle>
                    <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
                <span className={styles.label}>Check Delivery Availability</span>
            </div>

            <div className={styles.inputGroup}>
                <input
                    type="text"
                    placeholder="Enter Pincode"
                    className={styles.input}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                />
                <button
                    className={styles.button}
                    onClick={checkPincode}
                    disabled={status === 'loading' || pincode.length !== 6}
                >
                    {status === 'loading' ? 'Checking...' : 'Check'}
                </button>
            </div>

            {status === 'error' && <p className={styles.error}>{message}</p>}

            {status === 'success' && (
                <div className={styles.success}>
                    <p className={styles.deliveryText}>
                        Delivery within <span className={styles.bold}>6-8 business days</span> to
                    </p>
                    <p className={styles.location}>
                        {location}
                    </p>
                </div>
            )}
        </div>
    );
}
