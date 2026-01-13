
import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function forceInrPrices(scope: ExecArgs) {
    const logger = scope.container.resolve("logger")
    const productModuleService = scope.container.resolve(Modules.PRODUCT)
    const regionModuleService = scope.container.resolve(Modules.REGION)

    try {
        logger.info("Starting INR price update...")

        // 1. Get the India Region (or default)
        const regions = await regionModuleService.listRegions()
        let indiaRegion = regions.find(r => r.name.toLowerCase().includes("india")) || regions[0]

        if (!indiaRegion) {
            logger.error("No region found!")
            return
        }

        logger.info(`Targeting Region: ${indiaRegion.name} (${indiaRegion.id}) with currency ${indiaRegion.currency_code}`)

        // 2. Fetch the T-Shirt Products
        const products = await productModuleService.listProducts({
            q: "T-Shirt" // simple search, or retrieve all
        }, {
            relations: ["variants"]
        })

        if (products.length === 0) {
            logger.warn("No T-Shirt products found.")
            return
        }

        logger.info(`Found ${products.length} T-Shirt products.`)

        // 3. Update Prices
        for (const product of products) {
            logger.info(`Updating product: ${product.title}`)

            if (!product.variants || product.variants.length === 0) {
                logger.warn(`- No variants for ${product.title}`)
                continue
            }

            for (const variant of product.variants) {
                // We need to use the pricing module or update the product variant directly?
                // In Medusa 2, prices are typically handled via the Pricing Module or upserted via Product Module?
                // Product Module's `updateProducts` can take `variants`.

                // Construct price set
                // Note: In Medusa 2, we might need to use the 'prices' property on the variant update

                await productModuleService.updateProducts(product.id, {
                    variants: [
                        {
                            id: variant.id,
                            prices: [
                                {
                                    amount: 500000, // 5000.00 INR
                                    currency_code: 'inr',
                                    // rules: { region_id: indiaRegion.id } // Optional, usually currency is enough if region maps to it
                                }
                            ]
                        }
                    ]
                })
                logger.info(`- Updated variant ${variant.title} with 5000 INR`)
            }
        }

        logger.info("Successfully forced INR prices!")

    } catch (error) {
        logger.error(`Error updating prices: ${error}`)
    }
}
