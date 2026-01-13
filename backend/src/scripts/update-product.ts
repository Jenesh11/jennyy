import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

export default async function updateProduct({ container }: ExecArgs) {
    const logger = container.resolve("logger");
    const productModuleService = container.resolve(Modules.PRODUCT);

    const productId = "prod_01KEMVF00GQB1WZSQFFFG7WQYK";

    try {
        // 1. Create or retrieve Tag
        logger.info("Handling Tag...");
        let tagId;
        const existingTags = await productModuleService.listProductTags({ value: ["Jackets"] as any });
        if (existingTags.length > 0) {
            tagId = existingTags[0].id;
            logger.info(`Found existing tag: ${tagId}`);
        } else {
            const newTags = await productModuleService.createProductTags([{ value: "Jackets" }]);
            tagId = newTags[0].id;
            logger.info(`Created new tag: ${tagId}`);
        }

        // 2. Create or retrieve Type
        logger.info("Handling Type...");
        let typeId;
        const existingTypes = await productModuleService.listProductTypes({ value: ["Jackets"] });
        if (existingTypes.length > 0) {
            typeId = existingTypes[0].id;
            logger.info(`Found existing type: ${typeId}`);
        } else {
            const newTypes = await productModuleService.createProductTypes([{ value: "Jackets" }]);
            typeId = newTypes[0].id;
            logger.info(`Created new type: ${typeId}`);
        }

        // 3. Update Product
        logger.info(`Updating product with TypeID=${typeId} and TagID=${tagId}...`);

        await productModuleService.updateProducts(productId, {
            type_id: typeId,
            tag_ids: [tagId]
        });

        logger.info("Successfully updated product!");

        // Verify
        const updated = await productModuleService.retrieveProduct(productId, { relations: ["type", "tags"] });
        logger.info(`Verified - Type: ${updated.type?.value}, Tags: ${updated.tags?.map((t: any) => t.value).join(", ")}`);

    } catch (error) {
        logger.error(`Error updating product: ${error.message}`);
        console.error(error);
    }
}
