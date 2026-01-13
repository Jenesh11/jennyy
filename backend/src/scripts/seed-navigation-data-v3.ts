import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function seedNavigationData(scope: ExecArgs) {
    console.log("Script V3 Initializing...")
    try {
        const logger = scope.container.resolve("logger")
        const productModule = scope.container.resolve(Modules.PRODUCT)
        const regionModule = scope.container.resolve(Modules.REGION)

        console.log("Modules resolved.")

        // Menu Data
        const MENU = [
            {
                name: "Women",
                handle: "women",
                sections: [
                    {
                        title: "Western Wear",
                        items: ["Dresses", "Tops", "T-Shirts", "Jeans", "Skirts", "Jackets"]
                    },
                    {
                        title: "Ethnic & Fusion",
                        items: ["Kurtas", "Sarees", "Ethnic Sets", "Leggings", "Dupattas"]
                    },
                    {
                        title: "Footwear",
                        items: ["Flats", "Heels", "Sneakers", "Boots"]
                    },
                    {
                        title: "Beauty",
                        items: ["Makeup", "Skincare", "Fragrances"]
                    }
                ]
            },
            {
                name: "Kitchen & Home",
                handle: "kitchen-and-home",
                sections: [
                    {
                        title: "Kitchen",
                        items: ["Cookware", "Dinnerware", "Tools & Utensils", "Storage"]
                    },
                    {
                        title: "Home Decor",
                        items: ["Vases", "Candles", "Wall Art", "Mirrors"]
                    },
                    {
                        title: "Bed & Bath",
                        items: ["Bed Sheets", "Comforters", "Towels", "Bath Mats"]
                    },
                    {
                        title: "Furnishing",
                        items: ["Cushions", "Curtains", "Rugs"]
                    }
                ]
            }
        ]

        logger.info("Starting Navigation Data Seed...")

        // 0. Get Default Region (for pricing)
        const regions = await regionModule.listRegions()
        const regionId = regions[0]?.id
        console.log("Region found:", regionId)

        for (const root of MENU) {
            logger.info(`Processing Root: ${root.name}`)

            // 1. Create/Get Collection (for top-level link)
            // Check if exists logic omitted for brevity, just try to create or find
            let collection = (await productModule.listProductCollections({ handle: root.handle })).find(c => c.handle === root.handle)
            console.log("Collection check done.")

            if (!collection) {
                collection = await productModule.createProductCollections({
                    title: root.name,
                    handle: root.handle
                })
                logger.info(`- Created Collection: ${collection.title}`)
            } else {
                logger.info(`- Found Collection: ${collection.title}`)
            }

            // 2. Create Root Category (for Admin Tree)
            // Fetch all categories to check existence robustly
            // 2. Create Root Category (for Admin Tree)
            // Fetch all categories to check existence robustly
            // 2. Create Root Category (for Admin Tree)
            // Fetch all categories to check existence robustly
            const allCategories = await productModule.listProductCategories({}, { take: 1000, withDeleted: true, select: ["id", "handle", "name"] })
            console.log(`Debug: Existing Categories Sample:`, JSON.stringify(allCategories[0], null, 2))
            console.log(`Debug: Handles:`, allCategories.map(c => c.handle).join(", "))

            const rootCatHandle = root.handle
            let rootCategory = allCategories.find(c => c.handle === rootCatHandle)

            if (!rootCategory) {
                try {
                    rootCategory = await productModule.createProductCategories({
                        name: root.name,
                        handle: root.handle,
                        is_active: true,
                        is_internal: false
                    })
                    logger.info(`- Created Category: ${rootCategory.name}`)
                } catch (e) {
                    logger.warn(`- Category ${root.name} creation failed: ${e}`)
                    // If concurrent or weird state, try fetch again including deleted
                    try {
                        const candidates = await productModule.listProductCategories({ q: root.name }, { take: 1, withDeleted: true, select: ["id", "handle", "name"] })
                        rootCategory = candidates.find(c => c.handle === rootCatHandle)
                        if (rootCategory) {
                            logger.info(`- Found (possibly deleted) Category: ${rootCategory.name}, ID: ${rootCategory.id}`)
                            // Attempt restore just in case
                            // await productModule.restoreProductCategories([rootCategory.id]) 
                        }
                    } catch (err2) {
                        console.error("Fetch retry failed:", err2)
                    }
                }
            } else {
                logger.info(`- Found Category: ${rootCategory.name}`)
            }

            if (!rootCategory) {
                logger.error(`Critical: Could not find or create Root Category ${root.name}. Skipping sections.`)
                continue
            }

            // 3. Process Sections
            for (const section of root.sections) {
                const sectionHandle = `${root.handle}-${section.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
                let sectionCategory = (await productModule.listProductCategories({ handle: sectionHandle }, { select: ["id", "handle", "name"] })).find(c => c.handle === sectionHandle)

                if (!sectionCategory) {
                    try {
                        sectionCategory = await productModule.createProductCategories({
                            name: section.title,
                            handle: sectionHandle,
                            parent_category_id: rootCategory.id,
                            is_active: true
                        })
                        logger.info(`  - Created Sub-Category: ${section.title}`)
                    } catch (e) {
                        // fallback find
                        sectionCategory = (await productModule.listProductCategories({ handle: sectionHandle }, { select: ["id", "handle", "name"] })).find(c => c.handle === sectionHandle)
                    }
                }

                if (!sectionCategory) {
                    logger.warn(`Could not create section ${section.title}, skipping items.`)
                    continue
                }

                // 4. Process Items (Leaf nodes)
                for (const item of section.items) {
                    const itemHandle = `${sectionHandle}-${item.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
                    let itemCategory = (await productModule.listProductCategories({ handle: itemHandle }, { select: ["id", "handle", "name"] })).find(c => c.handle === itemHandle)

                    if (!itemCategory) {
                        try {
                            itemCategory = await productModule.createProductCategories({
                                name: item,
                                handle: itemHandle,
                                parent_category_id: sectionCategory.id,
                                is_active: true
                            })
                            logger.info(`    - Created Leaf Category: ${item}`)
                        } catch (e) {
                            itemCategory = (await productModule.listProductCategories({ handle: itemHandle }, { select: ["id", "handle", "name"] })).find(c => c.handle === itemHandle)
                        }
                    }

                    if (!itemCategory) {
                        logger.warn(`Could not create item category ${item}.`)
                        continue
                    }

                    // 5. Create Dummy Product for this Item
                    // Check if product exists with exact title to prevent dupes on re-run
                    const prodTitle = `Test ${item}` // e.g., "Test Dresses"
                    const existingProds = await productModule.listProducts({ q: prodTitle })

                    if (existingProds.length === 0) {
                        // Create Type first (required for V2 relation)
                        let productType = (await productModule.listProductTypes({ q: item }, { take: 1 })).find(t => t.value === item)
                        if (!productType) {
                            productType = await productModule.createProductTypes({ value: item })
                            logger.info(`    - Created Type: ${item}`)
                        }

                        // Create Product
                        await productModule.createProducts({
                            title: prodTitle,
                            subtitle: `Example ${item}`,
                            handle: itemHandle + "-product", // unique handle
                            status: "published",
                            collection_id: collection.id, // Assign to Root Collection so standard pages find it
                            type_id: productType.id, // Assign created type
                            // tags: [{ value: item }], 
                            category_ids: [itemCategory.id], // Assign to Admin Category Tree
                            variants: [
                                {
                                    title: "Default Variant",
                                    options: {
                                        "Size": "M"
                                    },
                                    // prices: ... skipping prices per lint complaint
                                }
                            ],
                            options: [
                                { title: "Size", values: ["M"] }
                            ]
                        })
                        logger.info(`      -> Created Product: ${prodTitle}`)
                    }
                }
            }
        }

        logger.info("Navigation Data Seed Complete!")

    } catch (error) {
        console.error("Critical script error:", error)
        try {
            const logger = scope.container.resolve("logger")
            logger.error(`Error seeding navigation: ${error}`)
        } catch (e) {
            // ignore
        }
    }
}
