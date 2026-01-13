
import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function debugProductModule(scope: ExecArgs) {
    const logger = scope.container.resolve("logger")
    const productModule = scope.container.resolve(Modules.PRODUCT)

    logger.info("Inspecting Product Module Methods:")

    // Log all properties that are functions
    const methods = []
    let obj = productModule
    while (obj) {
        Object.getOwnPropertyNames(obj).forEach(prop => {
            if (typeof productModule[prop] === 'function') {
                methods.push(prop)
            }
        })
        obj = Object.getPrototypeOf(obj)
    }

    // Filter unique and sort
    const uniqueMethods = [...new Set(methods)].sort()

    logger.info(JSON.stringify(uniqueMethods, null, 2))
}
