import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

export default async function inspectProduct({ container }: ExecArgs) {
    const logger = container.resolve("logger");
    const productModuleService = container.resolve(Modules.PRODUCT);

    const productId = "prod_01KEMVF00GQB1WZSQFFFG7WQYK";

    const product = await productModuleService.retrieveProduct(productId, {
        relations: ["images", "variants", "variants.options"]
    });

    logger.info("--- IMAGES ---");
    product.images.forEach(img => logger.info(`IMAGE: ${img.url} (ID: ${img.id})`));

    logger.info("--- VARIANTS ---");
    product.variants.forEach(v => {
        logger.info(`VARIANT: ${v.title} (ID: ${v.id})`);
        logger.info(`  Metadata: ${JSON.stringify(v.metadata)}`);
    });
}
