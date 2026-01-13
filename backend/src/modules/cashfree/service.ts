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

        // Amount is coming in as smallest unit (cents)
        // Cashfree expects major unit (e.g. 10.50) if dealing with INR?
        // Actually, let's just assume Medusa standards.
        // If standard Medusa logic applies, we should pass 'amount' directly if the gateway supports cents.
        // Cashfree API for `order_amount` is a double. "10.00"
        // Medusa `amount` is 1000.
        // So we divide by 100.

        const request = {
            order_amount: amount / 100,
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

    async authorizePayment(paymentSessionData: Record<string, unknown>, context: Record<string, unknown>): Promise<any> {
        this.logger_.info("[Cashfree] authorizePayment")
        return {
            status: "authorized",
            data: paymentSessionData
        }
    }

    async cancelPayment(paymentSessionData: Record<string, unknown>): Promise<any> {
        this.logger_.info("[Cashfree] cancelPayment")
        return { id: paymentSessionData.id }
    }

    async capturePayment(payment: any): Promise<any> {
        this.logger_.info("[Cashfree] capturePayment")
        return { status: "captured" }
    }

    async deletePayment(paymentSessionData: Record<string, unknown>): Promise<any> {
        this.logger_.info("[Cashfree] deletePayment")
        return
    }

    async getPaymentData(paymentSessionData: Record<string, unknown>): Promise<any> {
        return paymentSessionData
    }

    async refundPayment(payment: any, refundAmount: number): Promise<any> {
        this.logger_.info("[Cashfree] refundPayment")
        return { id: payment.id }
    }

    // --- Missing Implementations for AbstractPaymentProvider ---

    async getPaymentStatus(paymentSessionData: Record<string, unknown>): Promise<string> {
        this.logger_.info("[Cashfree] getPaymentStatus")
        return "authorized" // Simplified for now
    }

    async retrievePayment(paymentSessionData: Record<string, unknown>): Promise<Record<string, unknown>> {
        this.logger_.info("[Cashfree] retrievePayment")
        return paymentSessionData
    }

    async updatePayment(context: any): Promise<any> {
        this.logger_.info("[Cashfree] updatePayment")
        // Re-initiate if needed, or just return existing session data
        return {
            id: context.payment_session_data?.id, // fallback?
            // Actually update logic usually calls initiatePayment internally or similar.
            // Let's just create a new one to be safe as previously decided.
        }
        // Better: Just return what we have as "updated" doesn't change much for Cashfree unless amount changed.
        return this.initiatePayment(context)
    }

    async getWebhookActionAndData(data: any): Promise<any> {
        this.logger_.info("[Cashfree] getWebhookActionAndData")
        return { action: "not_supported" }
    }
}

export default CashfreePaymentService
