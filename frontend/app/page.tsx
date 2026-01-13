import Link from 'next/link';
import { getProducts } from '@/lib/medusa';
import ProductCard from '@/components/ProductCard';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const products = await getProducts({ limit: 4 });

  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Elevate Your Style
            </h1>
            <p className={styles.heroSubtitle}>
              Discover premium clothing crafted for the modern individual.
              Where comfort meets elegance.
            </p>
            <div className={styles.heroActions}>
              <Link href="/products" className="btn btn-primary">
                Shop Now
              </Link>
              <Link href="/products?category=new" className="btn btn-outline">
                New Arrivals
              </Link>
            </div>
          </div>
        </div>
        <div className={styles.heroOverlay}></div>
      </section>

      {/* Featured Products */}
      <section className="py-3xl">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Featured Collection</h2>
            <p className={styles.sectionSubtitle}>
              Handpicked pieces for this season
            </p>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-4">
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="9" cy="21" r="1" strokeWidth="2" />
                <circle cx="20" cy="21" r="1" strokeWidth="2" />
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h3>No products available yet</h3>
              <p>Check back soon for our latest collection!</p>
            </div>
          )}

          {products.length > 0 && (
            <div className={styles.viewAll}>
              <Link href="/products" className="btn btn-accent">
                View All Products
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className={`${styles.categories} py-3xl`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Shop by Category</h2>
          </div>

          <div className={styles.categoryGrid}>
            <Link href="/products?category=women" className={styles.categoryCard}>
              <div className={styles.categoryImage}>
                <div className={styles.categoryPlaceholder}>Women</div>
              </div>
              <h3 className={styles.categoryTitle}>Women's Collection</h3>
            </Link>

            <Link href="/products?category=men" className={styles.categoryCard}>
              <div className={styles.categoryImage}>
                <div className={styles.categoryPlaceholder}>Men</div>
              </div>
              <h3 className={styles.categoryTitle}>Men's Collection</h3>
            </Link>

            <Link href="/products?category=accessories" className={styles.categoryCard}>
              <div className={styles.categoryImage}>
                <div className={styles.categoryPlaceholder}>Accessories</div>
              </div>
              <h3 className={styles.categoryTitle}>Accessories</h3>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-3xl">
        <div className="container">
          <div className={styles.features}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 7h-4V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 5h4" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Premium Quality</h3>
              <p className={styles.featureText}>
                Crafted with the finest materials for lasting comfort and style.
              </p>
            </div>

            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="10" r="3" strokeWidth="2" />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Free Shipping</h3>
              <p className={styles.featureText}>
                Enjoy free shipping on all orders over $100 worldwide.
              </p>
            </div>

            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="9 22 9 12 15 12 15 22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Easy Returns</h3>
              <p className={styles.featureText}>
                30-day hassle-free returns on all purchases.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
