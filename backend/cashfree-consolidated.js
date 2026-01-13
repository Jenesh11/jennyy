"use strict";

const { Cashfree } = require("@cashfreepayments/cashfree-sdk");

// Inline Service Definition to guarantee loading
class CashfreePaymentService {
    // Static identifier is KEY for Medusa to register it correctly
    static identifier = "cashfree";

    constructor(container, options) {
        this.options_ = options || {};

        // Initialize SDK
        const appId = process.env.CASHFREE_APP_ID || options.app_id || options.appid;
        const secretKey = process.env.CASHFREE_SECRET_KEY || options.secret_key;
        const isSandbox = process.env.CASHFREE_SANDBOX === 'true' || options.sandbox === true;

        Cashfree.XClientId = appId;
        Cashfree.XClientSecret = secretKey;
        Cashfree.XEnvironment = isSandbox ? Cashfree.Environment.SANDBOX : Cashfree.Environment.PRODUCTION;

        console.log("[Cashfree] Initialized with App ID:", appId ? "***" + appId.slice(-4) : "MISSING");
    }

    // V2 Method: initiatePayment
    async initiatePayment(context) {
        console.log("[Cashfree] initiatePayment called with context:", JSON.stringify(context, null, 2));

        try {
            const { currency_code, amount, resource_id, customer, context: cartContext, email } = context;

            // Robust fallback for return_url
            const returnUrl = (cartContext && cartContext.return_url) ||
                "http://localhost:3000/order/confirmed";

            // V2 Amount is in Cents (Integer). Cashfree expects Major (Float)?
            // Let's verify standard behavior.
            // If amount is 1000 (INR 10.00).
            // Cashfree API docs say order_amount is double.
            // We should divide by 100 for INR.

            const finalAmount = amount / 100;

            const request = {
                order_amount: finalAmount,
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
            };

            console.log("[Cashfree] Creating Order:", request);

            const response = await Cashfree.PGCreateOrder("2023-08-01", request);
            console.log("[Cashfree] Order Created:", response.data);

            return {
                id: response.data.cf_order_id || response.data.order_id,
                data: response.data,
                session_data: response.data
            };
        } catch (error) {
            console.error("[Cashfree] initiatePayment Status Error:", error.response ? error.response.status : error);
            console.error("[Cashfree] initiatePayment Data Error:", error.response ? error.response.data : error.message);
            throw error;
        }
    }

    async authorizePayment(paymentSessionData, context) {
        console.log("[Cashfree] authorizePayment called");
        return {
            status: "authorized",
            data: paymentSessionData
        };
    }

    async cancelPayment(paymentSessionData) {
        console.log("[Cashfree] cancelPayment called");
        return { id: paymentSessionData.id };
    }

    async capturePayment(payment) {
        console.log("[Cashfree] capturePayment called");
        return { status: "captured" };
    }

    async deletePayment(paymentSessionData) {
        console.log("[Cashfree] deletePayment called");
        return;
    }

    async getPaymentData(paymentSessionData) {
        return paymentSessionData;
    }

    async refundPayment(payment, refundAmount) {
        console.log("[Cashfree] refundPayment called");
        return { id: payment.id };
    }
}

// Explicit assignment for V1 compatibility loading
CashfreePaymentService.identifier = "cashfree";

// Export as a Plugin definition
module.exports = {
    services: [CashfreePaymentService],
    // In case V2 loader looks for 'providers' or default export
    default: {
        services: [CashfreePaymentService]
    }
};
