'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { NAVIGATION } from '@/lib/constants';
import styles from './ProductFilters.module.css';

interface ProductFiltersProps {
    category?: string;
}

export default function ProductFilters({ category }: ProductFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const currentSub = searchParams.get('sub');

    // Find current category sections
    const categoryData = NAVIGATION.find(nav =>
        nav.href.includes(`category=${category}`)
    );

    // Flatten all items from all sections for the chips
    const filterItems = categoryData?.sections?.flatMap(section => section.items) || [];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        if (searchQuery) {
            params.set('q', searchQuery);
        } else {
            params.delete('q');
        }
        router.push(`/products?${params.toString()}`);
    };

    const handleFilterClick = (item: string) => {
        const params = new URLSearchParams(searchParams.toString());
        const normalizedItem = item.toLowerCase().replace(/\s+/g, '-');

        if (currentSub === normalizedItem) {
            params.delete('sub');
        } else {
            params.set('sub', normalizedItem);
        }
        router.push(`/products?${params.toString()}`);
    };

    if (!category) return null;

    return (
        <div className={styles.container}>
            {/* Search Bar */}
            <form onSubmit={handleSearch} className={styles.searchForm}>
                <div className={styles.inputWrapper}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.searchIcon}>
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                        type="text"
                        placeholder={`Search in ${category}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
            </form>

            {/* Filter Chips */}
            {filterItems.length > 0 && (
                <div className={styles.chipsContainer}>
                    {filterItems.map(item => {
                        const normalizedItem = item.toLowerCase().replace(/\s+/g, '-');
                        const isActive = currentSub === normalizedItem;

                        return (
                            <button
                                key={item}
                                onClick={() => handleFilterClick(item)}
                                className={`${styles.chip} ${isActive ? styles.active : ''}`}
                            >
                                {item}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
