import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

export default async function updateVariantImages({ container }: ExecArgs) {
    const logger = container.resolve("logger");
    const productModuleService = container.resolve(Modules.PRODUCT);

    const productId = "prod_01KEMVF00GQB1WZSQFFFG7WQYK";
    const greyVariantId = "variant_01KEMVF01W13BP4G5RHVVNS5W8";
    const brownVariantId = "variant_01KEMVF01WFC0S6765RWGF5GJ9";
    const originalImageId = "img_01KEMVF00H3SC8XH0JE27BB7ER";

    // New image for Brown variant (using a public Medusa sample that looks distinct)
    const newImageUrl = "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png";

    try {
        logger.info("Step 1: Adding new image to product...");
        // We need to update the product to include the new image first
        // Note: This replaces the images array if we are not careful, so we fetch existing ones first.
        // Actually, updateProducts with 'images' usually appends or replaces? Medusa 2.0 behaviors vary.
        // Safest is to list existing, add new one.

        const product = await productModuleService.retrieveProduct(productId, { relations: ["images"] });
        const existingImages = product.images.map(img => ({ url: img.url }));

        // Add new image
        const updatedProduct = await productModuleService.updateProducts(productId, {
            images: [
                ...existingImages,
                { url: newImageUrl }
            ]
        });

        // Find the ID of the new image
        const allImages = await productModuleService.retrieveProduct(productId, { relations: ["images"] });
        const newImage = allImages.images.find(img => img.url === newImageUrl);

        if (!newImage) {
            throw new Error("Failed to find new image after upload");
        }

        logger.info(`New Image ID: ${newImage.id}`);

        logger.info("Step 2: Assigning images to variants via updateProducts...");

        await productModuleService.updateProducts(productId, {
            variants: [
                {
                    id: greyVariantId,
                    metadata: {
                        image_id: originalImageId,
                        image_url: "http://localhost:9000/static/1768078934018-shopping.webp"
                    }
                },
                {
                    id: brownVariantId,
                    metadata: {
                        image_id: newImage.id,
                        image_url: newImageUrl
                    }
                }
            ]
        });

        logger.info("Successfully updated variants with image metadata!");

        // Also, try to see if I can set `variant_id` on the Image object? (Many-to-many?)
        // This is often how it works - images are linked to variants.
        // I can't easily do that via simple updateProducts usually.


    } catch (error) {
        logger.error(`Error updating variant images: ${error.message}`);
        console.error(error);
    }
}
