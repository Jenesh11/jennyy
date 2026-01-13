import {
    ExecArgs,
    IMedusaContext,
    IProductModuleService,
    IRegionModuleService,
} from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

export default async function updateRegionCurrency(
    { container }: ExecArgs
) {
    const regionModuleService: IRegionModuleService = container.resolve(
        Modules.REGION
    );

    const productModuleService: IProductModuleService = container.resolve(
        Modules.PRODUCT
    );

    const ctx: IMedusaContext = {};

    console.log("Fetching regions...");
    const regions = await regionModuleService.listRegions({}, { take: 1 });

    if (regions.length === 0) {
        console.log("No regions found to update.");
        return;
    }

    const defaultRegion = regions[0];
    console.log(`Updating region ${defaultRegion.id} (${defaultRegion.name}) to support INR...`);

    // Update region to handle INR
    // Note: Medusa 2.0 uses 'currency_code' directly on region usually or 'payment_providers' that support it.
    // But strictly strictly we want to ensure 'currency_code' is 'inr' if that's the primary.

    await regionModuleService.updateRegions(defaultRegion.id, {
        currency_code: "inr",
        // You might need to add payment providers that support INR, but for now we just change currency
    });

    console.log("Region updated to INR.");

    // Also need to ensure products have INR prices?
    // If we change region currency, old prices in USD might not show if context searches for INR.
    // Let's add an INR price to all products for safety.

    console.log("Adding INR prices to all products...");
    const products = await productModuleService.listProducts({}, { relations: ["variants"] });

    for (const product of products) {
        if (!product.variants) continue;

        const variantUpdates = product.variants.map(v => ({
            id: v.id,
            prices: [
                {
                    currency_code: "inr",
                    amount: 500000, // Dummy price 5000 INR (amount in cents/lowest unit)
                }
            ]
        }));

        await productModuleService.updateProducts(product.id, {
            variants: variantUpdates
        });
    }

    console.log("Products updated with dummy INR prices.");
}
