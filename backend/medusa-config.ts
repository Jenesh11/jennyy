import { loadEnv, defineConfig } from '@medusajs/framework/utils'
import path from 'path'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: [
    {
      resolve: "@medusajs/payment",
      options: {
        providers: [
          {
            resolve: path.resolve(process.cwd(), "src/modules/cashfree"),
            id: "cashfree",
            options: {
              app_id: process.env.CASHFREE_APP_ID,
              secret_key: process.env.CASHFREE_SECRET_KEY,
              sandbox: process.env.CASHFREE_SANDBOX === 'true',
            },
          },
        ],
      },
    },
  ]
})
