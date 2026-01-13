import { notFound } from 'next/navigation';
import { getProduct } from '@/lib/medusa';
import ProductDetail from '@/components/ProductDetail';

interface ProductPageProps {
    params: Promise<{
        id: string;
    }>;
}

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: ProductPageProps) {
    const { id } = await params;
    const product = await getProduct(id);

    if (product?.variants) {
        console.log("SERVER VARIANT META CHECK:", JSON.stringify(product.variants.map((v: any) => ({ id: v.id, meta: v.metadata })), null, 2));
    }

    if (!product) {
        notFound();
    }

    return <ProductDetail product={product} />;
}
