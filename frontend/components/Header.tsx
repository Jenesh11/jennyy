'use client';

import Link from 'next/link';
import { useState } from 'react';
import styles from './Header.module.css';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { NAVIGATION } from '@/lib/constants';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { cartCount } = useCart();
    const { user, openLoginModal, logout } = useAuth();
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    return (
        <header className={styles.header}>
            <div className="container">
                <div className={styles.headerContent}>
                    {/* Logo */}
                    <Link href="/" className={styles.logo}>
                        <span className={styles.logoText}>Jennyy</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className={styles.nav}>
                        {NAVIGATION.map((item) => (
                            <div
                                key={item.name}
                                className={styles.navItem}
                                onMouseEnter={() => setActiveMenu(item.name)}
                                onMouseLeave={() => setActiveMenu(null)}
                            >
                                <Link href={item.href} className={`${styles.navLink} ${activeMenu === item.name ? styles.active : ''}`}>
                                    {item.name}
                                </Link>

                                {item.sections && activeMenu === item.name && (
                                    <div className={styles.megaMenuWrapper}>
                                        <div className={styles.megaMenu}>
                                            {item.sections.map((section) => (
                                                <div key={section.title} className={styles.megaMenuSection}>
                                                    <h4 className={styles.megaMenuTitle}>{section.title}</h4>
                                                    <ul className={styles.megaMenuList}>
                                                        {section.items.map((subItem) => (
                                                            <li key={subItem}>
                                                                <Link
                                                                    href={`${item.href}&sub=${subItem.toLowerCase().replace(/\s+/g, '-')}`}
                                                                    className={styles.megaMenuLink}
                                                                >
                                                                    {subItem}
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className={styles.actions}>
                        <button className={styles.iconBtn} aria-label="Search">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                                <circle cx="8" cy="8" r="6" strokeWidth="2" />
                                <path d="M12.5 12.5L17 17" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </button>

                        <Link href="/cart" className={styles.iconBtn} aria-label="Cart">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                                <path d="M1 1h3l2.68 13.39a1 1 0 001 .78h9.72a1 1 0 001-.78L20 5H5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            {cartCount > 0 && (
                                <span className={styles.cartBadge}>{cartCount}</span>
                            )}
                        </Link>

                        {/* Auth Button */}
                        {!user ? (
                            <button
                                className={styles.authBtn}
                                onClick={openLoginModal}
                            >
                                SIGN UP / SIGN IN
                            </button>
                        ) : (
                            <div className={styles.userMenu}>
                                <span className={styles.userName}>Hi, Guest</span>
                                <button className={styles.logoutBtn} onClick={logout}>Sign Out</button>
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            className={styles.menuToggle}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            <span className={`${styles.menuBar} ${isMenuOpen ? styles.open : ''}`}></span>
                            <span className={`${styles.menuBar} ${isMenuOpen ? styles.open : ''}`}></span>
                            <span className={`${styles.menuBar} ${isMenuOpen ? styles.open : ''}`}></span>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <nav className={styles.mobileNav}>
                        {NAVIGATION.map((item) => (
                            <div key={item.name} className={styles.mobileNavItem}>
                                <Link
                                    href={item.href}
                                    className={styles.mobileNavLink}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            </div>
                        ))}
                    </nav>
                )}
            </div>
        </header >
    );
}
