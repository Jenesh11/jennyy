
import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function updateStoreCurrency(scope: ExecArgs) {
    const logger = scope.container.resolve("logger")
    const storeModuleService = scope.container.resolve(Modules.STORE)

    try {
        logger.info("Starting Store Currency Update to INR...")

        // 1. Get the Store(s)
        const stores = await storeModuleService.listStores()

        if (stores.length === 0) {
            logger.warn("No stores found to update!")
            return
        }

        const defaultStore = stores[0]
        logger.info(`Found store: ${defaultStore.name} (${defaultStore.id})`)
        logger.info(`Current default currency: ${defaultStore.default_currency_code}`)

        // 2. Update Store
        // We need to ensure 'inr' is in supported_currencies and set as default.
        // In Medusa 2, updateStores accepts 'supported_currency_codes' (array of strings) usually.

        // Get current supported codes to append, or just reset/ensure
        // Typically stores have a getter or we assume. 
        // Let's just pass `supported_currency_codes` including 'inr'.

        // Wait, stores usually have `supported_currencies` relation. 
        // But `updateStores` DTO usually takes `supported_currency_codes` as a convenience?
        // Let's try passing `supported_currency_codes`.

        // We'll also preserve existing ones if we can read them, but `listStores` might not expand them by default.
        // Let's try to just ADD 'inr' and set 'inr' as default.

        await storeModuleService.updateStores(defaultStore.id, {
            supported_currencies: [
                { currency_code: "inr", is_default: true },
                { currency_code: "eur", is_default: false },
                { currency_code: "usd", is_default: false }
            ]
        })

        logger.info("Successfully updated Store default currency to INR.")

    } catch (error) {
        logger.error(`Error updating store currency: ${error}`)
    }
}
