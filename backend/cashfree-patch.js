"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _cashfreeSdk = require("@cashfreepayments/cashfree-sdk");

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () { })); return true; } catch (e) { return false; } }

// Mock PaymentService if medusa-interfaces is missing
var PaymentService;
try {
    PaymentService = require("medusa-interfaces").PaymentService;
} catch (e) {
    PaymentService = class MockPaymentService {
        constructor() { }
    };
}

var CashfreePaymentService = /*#__PURE__*/function (_PaymentService) {
    (0, _inherits2["default"])(CashfreePaymentService, _PaymentService);

    var _super = _createSuper(CashfreePaymentService);

    function CashfreePaymentService(_ref, options) {
        var _this;

        (0, _classCallCheck2["default"])(this, CashfreePaymentService);
        _this = _super.call(this); // arguments[0] is access to container services

        _this.manager_ = _ref.manager;
        _this.orderService_ = _ref.orderService;
        _this.options_ = options; // Initialize Cashfree

        _cashfreeSdk.Cashfree.XClientId = process.env.CASHFREE_APP_ID || options.appid;
        _cashfreeSdk.Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY || options.secret_key;
        _cashfreeSdk.Cashfree.XEnvironment = process.env.CASHFREE_SANDBOX === 'true' ? _cashfreeSdk.Cashfree.Environment.SANDBOX : _cashfreeSdk.Cashfree.Environment.PRODUCTION;
        return _this;
    }

    (0, _createClass2["default"])(CashfreePaymentService, [{
        key: "createPayment",
        value: function () {
            var _createPayment = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(cart) {
                var _cart$context, _cart$billing_address, _cart$billing_address2, return_url, request, response;

                return _regenerator["default"].wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                console.log("[Cashfree] createPayment called for Cart ID:", cart.id);
                                _context.prev = 1;

                                // Robust Return URL Logic
                                // Prioritize cart context (set by frontend V2 manual call if passed) or fallback
                                return_url = (cart.context && cart.context.return_url) ||
                                    (cart === null || cart === void 0 ? void 0 : cart.return_url) ||
                                    "http://localhost:3000/order/confirmed";

                                request = {
                                    order_amount: cart.total / 100, // Medusa amounts are in cents/paise
                                    order_currency: (cart.region && cart.region.currency_code) ? cart.region.currency_code.toUpperCase() : "INR",
                                    order_id: cart.id,
                                    customer_details: {
                                        customer_id: cart.customer_id || cart.email || "guest_user",
                                        customer_phone: (cart.shipping_address && cart.shipping_address.phone) || "9999999999",
                                        customer_name: (cart.shipping_address && (cart.shipping_address.first_name + " " + cart.shipping_address.last_name)) || "Guest",
                                        customer_email: cart.email || "guest@example.com"
                                    },
                                    order_meta: {
                                        return_url: return_url
                                    }
                                };

                                console.log("[Cashfree] Creating Order with payload:", JSON.stringify(request, null, 2));

                                _context.next = 5;
                                return _cashfreeSdk.Cashfree.PGCreateOrder("2023-08-01", request);

                            case 5:
                                response = _context.sent;
                                console.log("[Cashfree] Order Created Response:", JSON.stringify(response.data));

                                // Return just the data needed for the session
                                return _context.abrupt("return", response.data);

                            case 9:
                                _context.prev = 9;
                                _context.t0 = _context["catch"](1);
                                console.error("[Cashfree] Error in createPayment:", _context.t0);
                                // Throwing here is risky if default error handling is bad, but 500 is what we get.
                                // Let's throw properly formatted error.
                                throw _context.t0;

                            case 13:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, null, [[1, 9]]);
            }));

            function createPayment(_x) {
                return _createPayment.apply(this, arguments);
            }

            return createPayment;
        }()
    }, {
        key: "getPaymentData",
        value: function () {
            var _getPaymentData = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(sessionData) {
                return _regenerator["default"].wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                return _context2.abrupt("return", sessionData);

                            case 1:
                            case "end":
                                return _context2.stop();
                        }
                    }
                }, _callee2);
            }));

            function getPaymentData(_x2) {
                return _getPaymentData.apply(this, arguments);
            }

            return getPaymentData;
        }()
    }, {
        key: "authorizePayment",
        value: function () {
            var _authorizePayment = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(paymentSessionData, context) {
                return _regenerator["default"].wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                console.log("[Cashfree] authorizePayment called");
                                return _context3.abrupt("return", {
                                    status: "authorized",
                                    data: paymentSessionData
                                });

                            case 1:
                            case "end":
                                return _context3.stop();
                        }
                    }
                }, _callee3);
            }));

            function authorizePayment(_x3, _x4) {
                return _authorizePayment.apply(this, arguments);
            }

            return authorizePayment;
        }()
    }, {
        key: "updatePayment",
        value: function () {
            var _updatePayment = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(paymentSessionData, cart) {
                return _regenerator["default"].wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                console.log("[Cashfree] updatePayment called - Creating New Order");
                                _context5.next = 3;
                                return this.createPayment(cart);

                            case 3:
                                return _context5.abrupt("return", _context5.sent);

                            case 4:
                            case "end":
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function updatePayment(_x7, _x8) {
                return _updatePayment.apply(this, arguments);
            }

            return updatePayment;
        }()
    }, {
        key: "deletePayment",
        value: function () {
            return Promise.resolve();
        }
    }, {
        key: "updatePaymentData",
        value: function (sessionData, update) {
            return Promise.resolve(sessionData);
        }
    }, {
        key: "cancelPayment",
        value: function (payment) {
            return Promise.resolve({ id: payment.id });
        }
    }, {
        key: "capturePayment",
        value: function (payment) {
            return Promise.resolve({ status: "captured" });
        }
    }, {
        key: "refundPayment",
        value: function (payment, amountToRefund) {
            return Promise.resolve({ id: payment.id });
        }
    }]);

    return CashfreePaymentService;
}(PaymentService);

(0, _defineProperty2["default"])(CashfreePaymentService, "identifier", 'cashfree');
var _default = CashfreePaymentService;
exports["default"] = _default;
