import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

// Comprehensive list of sub-sections from Header.tsx
const SUB_SECTIONS = [
    // Men
    'T-Shirts', 'Polos', 'Casual Shirts', 'Formal Shirts', 'Sweatshirts', 'Jackets',
    'Jeans', 'Trousers', 'Shorts', 'Trackpants', 'Joggers',
    'Bags', 'Belts', 'Wallets', 'Socks', 'Caps',

    // Women
    'Dresses', 'Tops', 'Skirts',
    // 'T-Shirts', 'Jeans', 'Jackets' (Duplicates handled by Set)
    'Kurtas', 'Sarees', 'Ethnic Sets', 'Leggings', 'Dupattas',
    'Flats', 'Heels', 'Sneakers', 'Boots',
    'Makeup', 'Skincare', 'Fragrances',

    // Kitchen & Home
    'Cookware', 'Dinnerware', 'Tools & Utensils', 'Storage',
    'Vases', 'Candles', 'Wall Art', 'Mirrors',
    'Bed Sheets', 'Comforters', 'Towels', 'Bath Mats',
    'Cushions', 'Curtains', 'Rugs'
];

export default async function bulkSeedMetadata({ container }: ExecArgs) {
    const logger = container.resolve("logger");
    const productModuleService = container.resolve(Modules.PRODUCT);

    // Use a Set to ensure uniqueness
    const uniqueItems = [...new Set(SUB_SECTIONS)];

    logger.info(`Starting bulk seed for ${uniqueItems.length} unique metadata items...`);

    for (const item of uniqueItems) {
        try {
            // 1. Create Product Tag
            const existingTags = await productModuleService.listProductTags({ value: [item] as any });
            if (existingTags.length === 0) {
                await productModuleService.createProductTags([{ value: item }]);
                logger.info(`Created Tag: ${item}`);
            } else {
                logger.info(`Tag already exists: ${item}`);
            }

            // 2. Create Product Type
            const existingTypes = await productModuleService.listProductTypes({ value: [item] });
            if (existingTypes.length === 0) {
                await productModuleService.createProductTypes([{ value: item }]);
                logger.info(`Created Type: ${item}`);
            } else {
                logger.info(`Type already exists: ${item}`);
            }

        } catch (error) {
            logger.error(`Failed to seed ${item}: ${error.message}`);
        }
    }

    logger.info("Bulk metadata seeding complete! All types and tags are now available.");
}
