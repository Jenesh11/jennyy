import { getProducts, getCollectionByHandle } from '@/lib/medusa';
import ProductCard from '@/components/ProductCard';
import ProductFilters from '@/components/ProductFilters';
import Fuse from 'fuse.js';
import styles from './page.module.css';

interface ProductsPageProps {
    searchParams: Promise<{
        category?: string;
        sub?: string;
        q?: string;
    }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
    const { category, sub, q } = await searchParams;
    let products = [];
    let title = "All Products";

    const filterProducts = (prods: any[], query?: string, subCategory?: string) => {
        let filtered = prods;

        // 1. Search Query Filter (Fuzzy Search)
        if (query) {
            const fuse = new Fuse(filtered, {
                keys: [
                    { name: 'title', weight: 0.7 },
                    { name: 'description', weight: 0.4 },
                    { name: 'type.value', weight: 0.5 },
                    { name: 'tags.value', weight: 0.6 },
                    { name: 'handle', weight: 0.3 }
                ],
                includeScore: true,
                threshold: 0.4, // 0.0 = perfect match, 1.0 = match anything. 0.4 is good for typos
                ignoreLocation: true, // find anywhere in string
                minMatchCharLength: 2,
            });

            const fuseResults = fuse.search(query);
            filtered = fuseResults.map((result: any) => result.item);
        }

        // 2. Sub-category Filter (Strict)
        if (subCategory) {
            // Normalize search term: 't-shirts' -> 't shirts'
            const rawSub = subCategory.toLowerCase();
            const normalizedSub = subCategory.replace(/-/g, ' ').toLowerCase();
            const cleanSub = rawSub.replace(/[^a-z0-9]/g, '');

            filtered = filtered.filter((product: any) => {
                const typeValue = product.type?.value?.toLowerCase() || '';
                const cleanType = typeValue.replace(/[^a-z0-9]/g, '');

                const isTypeMatch = cleanType.includes(cleanSub);
                const tagMatch = product.tags?.some((tag: any) => {
                    const t = tag.value.toLowerCase().replace(/[^a-z0-9]/g, '');
                    return t.includes(cleanSub);
                });

                return isTypeMatch || tagMatch;
            });
        }

        return filtered;
    };

    if (category) {
        const collection = await getCollectionByHandle(category);
        if (collection) {
            // Fetch more fields for filtering
            let categoryProducts = await getProducts({
                collection_id: [collection.id],
                limit: 100,
                fields: "+type,+tags,+images,+variants,+description"
            });

            // Apply filters (sub-category AND search query)
            products = filterProducts(categoryProducts, q, sub);

            if (sub) {
                const normalizedSub = sub.replace(/-/g, ' ');
                title = `${collection.title} > ${normalizedSub.charAt(0).toUpperCase() + normalizedSub.slice(1)}`;
            } else {
                title = collection.title;
            }

        } else {
            products = [];
            title = category.charAt(0).toUpperCase() + category.slice(1);
        }
    } else {
        // General Shop All or generic search
        let allProducts = await getProducts({
            limit: 100,
            fields: "+type,+tags,+images,+variants,+description"
        });

        products = filterProducts(allProducts, q, sub);

        if (q) {
            title = `Search: "${q}"`;
        }
    }

    return (
        <div className={styles.productsPage}>
            <div className="container py-3xl">
                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.title}>{title}</h1>
                    <p className={styles.subtitle}>
                        {category
                            ? `Browse our ${title} collection`
                            : "Discover our complete collection of premium clothing"
                        }
                    </p>
                </div>

                {/* Mobile Filters */}
                {category && <ProductFilters category={category} />}

                {/* Products Grid */}
                {products.length > 0 ? (
                    <>
                        <div className={styles.results}>
                            <p className={styles.count}>{products.length} products</p>
                        </div>

                        <div className="grid grid-4">
                            {products.map((product: any) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className={styles.emptyState}>
                        <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="9" cy="21" r="1" strokeWidth="2" />
                            <circle cx="20" cy="21" r="1" strokeWidth="2" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <h2>No products found</h2>
                        <p>
                            Try adjusting your search or filters.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
