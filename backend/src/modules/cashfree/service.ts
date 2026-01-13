import { AbstractPaymentProvider } from "@medusajs/framework/utils"
import { Logger } from "@medusajs/framework/types"
import { Cashfree } from "@cashfreepayments/cashfree-sdk"

type Options = {
    app_id: string
    secret_key: string
    sandbox: boolean
}

class CashfreePaymentService extends AbstractPaymentProvider<Options> {
    static identifier = "cashfree"
    protected logger_: Logger
    protected options_: Options

    constructor(container: { logger: Logger }, options: Options) {
        super(container, options)
        this.logger_ = container.logger
        this.options_ = options

        const appId = process.env.CASHFREE_APP_ID || options.app_id
        const secretKey = process.env.CASHFREE_SECRET_KEY || options.secret_key
        const isSandbox = process.env.CASHFREE_SANDBOX === 'true' || options.sandbox

        if (appId && secretKey) {
            Cashfree.XClientId = appId
            Cashfree.XClientSecret = secretKey
            Cashfree.XEnvironment = isSandbox ? Cashfree.Environment.SANDBOX : Cashfree.Environment.PRODUCTION
            this.logger_.info(`[Cashfree] Initialized with App ID ending in ${appId.slice(-4)}`)
        } else {
            this.logger_.error("[Cashfree] Missing Credentials! Please check .env")
        }
    }

    async initiatePayment(context: any): Promise<any> {
        this.logger_.info(`[Cashfree] initiatePayment: ${JSON.stringify(context.amount)}`)

        const { currency_code, amount, resource_id, customer, context: cartContext, email } = context

        // Robust fallback for return_url
        const returnUrl = (cartContext && cartContext.return_url) ||
            "http://localhost:3000/order/confirmed"

        const request = {
            order_amount: amount / 100, // Handle decimals
            order_currency: (currency_code || "INR").toUpperCase(),
            order_id: resource_id || "order_" + Date.now(),
            customer_details: {
                customer_id: (customer && customer.id) || "guest_" + Date.now(),
                customer_phone: (customer && customer.phone) || "9999999999",
                customer_name: (customer && (customer.first_name || customer.last_name)) ? `${customer.first_name} ${customer.last_name}` : "Guest",
                customer_email: (customer && customer.email) || email || "guest@example.com"
            },
            order_meta: {
                return_url: returnUrl
            }
        }

        try {
            const response = await Cashfree.PGCreateOrder("2023-08-01", request)
            this.logger_.info(`[Cashfree] Order Created: ${response.data.cf_order_id}`)
            return {
                id: response.data.cf_order_id || response.data.order_id,
                data: response.data,
                session_data: response.data
            }
        } catch (error: any) {
            this.logger_.error(`[Cashfree] Creation Error: ${error.message}`)
            throw error
        }
    }

    async authorizePayment(input: any): Promise<any> {
        this.logger_.info("[Cashfree] authorizePayment")
        return {
            status: "authorized",
            data: input.payment_session_data || input
        }
    }

    async cancelPayment(input: any): Promise<any> {
        this.logger_.info("[Cashfree] cancelPayment")
        return { id: input.id || input.payment_session_data?.id }
    }

    async capturePayment(input: any): Promise<any> {
        this.logger_.info("[Cashfree] capturePayment")
        return { status: "captured" }
    }

    async deletePayment(input: any): Promise<any> {
        this.logger_.info("[Cashfree] deletePayment")
        return {}
    }

    async getPaymentData(input: any): Promise<any> {
        return input.payment_session_data || input
    }

    async refundPayment(input: any): Promise<any> {
        this.logger_.info("[Cashfree] refundPayment")
        return { id: input.id || input.payment_session_data?.id }
    }

    async getPaymentStatus(input: any): Promise<any> {
        this.logger_.info("[Cashfree] getPaymentStatus")
        return "authorized"
    }

    async retrievePayment(input: any): Promise<any> {
        this.logger_.info("[Cashfree] retrievePayment")
        return input.payment_session_data || input
    }

    async updatePayment(context: any): Promise<any> {
        this.logger_.info("[Cashfree] updatePayment")
        return this.initiatePayment(context)
    }

    async getWebhookActionAndData(data: any): Promise<any> {
        this.logger_.info("[Cashfree] getWebhookActionAndData")
        return { action: "not_supported" }
    }
}

export default CashfreePaymentService
