import {
    ExecArgs,
    IProductModuleService,
} from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

export default async function inspectTShirts(
    { container }: ExecArgs
) {
    const productModuleService: IProductModuleService = container.resolve(
        Modules.PRODUCT
    );

    console.log("Fetching all products...");
    const products = await productModuleService.listProducts({}, {
        relations: ["variants", "collection", "categories"]
    });

    console.log(`Found ${products.length} products total.`);

    for (const product of products) {
        console.log(`\nProduct: ${product.title} (ID: ${product.id})`);
        console.log(`  Status: ${product.status}`);
        console.log(`  Collection: ${product.collection ? product.collection.title : 'None'}`);
        console.log(`  Variants: ${product.variants?.length || 0}`);

        if (product.variants) {
            for (const v of product.variants) {
                // We can't easily see prices via product module service directly without pricing module usually, 
                // but let's see if 'prices' relation is exposed or if we need pricing service.
                // Actually, product variants in Medusa 2.0 product module don't always hydrate prices by default 
                // without passing context or using PricingModule.
                console.log(`    Variant: ${v.title} (ID: ${v.id})`);
            }
        }
    }
}
