'use client';

import Image from 'next/image';
import styles from './ProductGallery.module.css';
import { useState, useEffect } from 'react';

interface ProductGalleryProps {
    images: {
        id: string;
        url: string;
        alt?: string;
    }[];
    selectedImage?: string; // Controlled state from parent
}

export default function ProductGallery({ images, selectedImage }: ProductGalleryProps) {
    const [currentImage, setCurrentImage] = useState(images[0]?.url);

    // Sync with parent controlled state if provided
    useEffect(() => {
        if (selectedImage) {
            setCurrentImage(selectedImage);
        } else if (images && images.length > 0) {
            // Loop logic: if props change, reset to first image of new set
            // This is crucial for filtering scenarios
            setCurrentImage(images[0].url);
        }
    }, [selectedImage, images]);

    // Handle internal selection
    const handleImageSelect = (url: string) => {
        setCurrentImage(url);
    };

    if (!images || images.length === 0) {
        return (
            <div className={styles.mainImageWrapper}>
                <div className={styles.placeholder}>
                    No images available
                </div>
            </div>
        );
    }

    return (
        <div className={styles.gallery}>
            {/* Main Image */}
            <div className={styles.mainImageWrapper}>
                <Image
                    src={currentImage || images[0].url}
                    alt="Product Main View"
                    fill
                    className={styles.mainImage}
                    priority
                />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className={styles.thumbnails}>
                    {images.map((image) => (
                        <button
                            key={image.id}
                            className={`${styles.thumbnailBtn} ${currentImage === image.url ? styles.active : ''}`}
                            onClick={() => handleImageSelect(image.url)}
                            aria-label="View image"
                        >
                            <Image
                                src={image.url}
                                alt="Product Thumbnail"
                                fill
                                className={styles.thumbImage}
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
