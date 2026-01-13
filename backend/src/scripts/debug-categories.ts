
import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function debugCategories(scope: ExecArgs) {
    const productModule = scope.container.resolve(Modules.PRODUCT)
    console.log("DEBUG: Starting Category Inspection")

    try {
        // 1. No Config
        console.log("--- Test 1: No Config ---")
        const cat1 = await productModule.listProductCategories({}, { take: 1 })
        console.log("Result 1:", JSON.stringify(cat1[0] || "No categories found", null, 2))

        // 2. With Fields
        console.log("--- Test 2: With Fields ---")
        const cat2 = await productModule.listProductCategories({}, { take: 1, fields: "+id,+handle,+name" })
        console.log("Result 2:", JSON.stringify(cat2[0] || "No categories found", null, 2))

        // 3. With Select (if valid)
        console.log("--- Test 3: With Select ---")
        try {
            const cat3 = await productModule.listProductCategories({}, { take: 1, select: ["id", "handle", "name"] })
            console.log("Result 3:", JSON.stringify(cat3[0] || "No categories found", null, 2))
        } catch (e) {
            console.log("Test 3 Failed:", e.message)
        }

    } catch (e) {
        console.error("FATAL:", e)
    }
}
