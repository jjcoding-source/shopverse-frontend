import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronRight, Shield, Lock, CreditCard,
  Truck, Check, ChevronDown, ShoppingCart,
} from "lucide-react";
import { useCart }    from "@/hooks/useCart";
import { useAuth }    from "@/hooks/useAuth";
import { formatPrice } from "@/utils/formatPrice";
import { ordersAPI }  from "@/store/api/ordersApi";
import toast          from "react-hot-toast";

const STEPS = [
  { id: 1, label: "Cart"     },
  { id: 2, label: "Shipping" },
  { id: 3, label: "Payment"  },
  { id: 4, label: "Review"   },
];

const COUNTRIES = [
  "United States", "United Kingdom", "Canada",
  "Australia", "Germany", "France", "India",
  "Japan", "Singapore", "UAE",
];

const StepIndicator = ({ currentStep }) => (
  <div className="flex items-center justify-center gap-0 mb-8">
    {STEPS.map((step, idx) => (
      <div key={step.id} className="flex items-center">
        <div className="flex flex-col items-center gap-1.5">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step.id < currentStep
                ? "bg-primary-600 text-white"
                : step.id === currentStep
                ? "bg-primary-600 text-white ring-4 ring-primary-100"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {step.id < currentStep ? <Check size={14} /> : step.id}
          </div>
          <span
            className={`text-xs font-medium hidden sm:block ${
              step.id <= currentStep ? "text-primary-600" : "text-gray-400"
            }`}
          >
            {step.label}
          </span>
        </div>
        {idx < STEPS.length - 1 && (
          <div
            className={`w-16 sm:w-24 h-0.5 mb-4 mx-1 transition-all ${
              step.id < currentStep ? "bg-primary-600" : "bg-gray-200"
            }`}
          />
        )}
      </div>
    ))}
  </div>
);

const InputField = ({ label, error, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-gray-700">{label}</label>
    <input
      className={`input-field ${
        error ? "border-red-400 focus:border-red-400 focus:ring-red-50" : ""
      }`}
      {...props}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const Checkout = () => {
  const navigate          = useNavigate();
  const { items, total, count, clear } = useCart();
  const { user }          = useAuth();

  const [step,    setStep]    = useState(2);
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  const [shipping, setShipping] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    lastName:  user?.name?.split(" ")[1] || "",
    email:     user?.email               || "",
    phone:     "",
    address:   "",
    city:      "",
    state:     "",
    zip:       "",
    country:   "United States",
  });

  const [payment, setPayment] = useState({
    method:     "card",
    cardNumber: "",
    cardName:   "",
    expiry:     "",
    cvv:        "",
    saveCard:   false,
  });

  const shippingCost = total >= 75 ? 0 : 9.99;
  const tax          = (total) * 0.08;
  const orderTotal   = total + shippingCost + tax;

  const updateShipping = (field, value) =>
    setShipping((p) => ({ ...p, [field]: value }));

  const updatePayment = (field, value) =>
    setPayment((p) => ({ ...p, [field]: value }));

  const formatCard = (val) =>
    val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

  const formatExpiry = (val) =>
    val.replace(/\D/g, "").slice(0, 4).replace(/(.{2})/, "$1/");

  const validateShipping = () => {
    const e = {};
    if (!shipping.firstName.trim()) e.firstName = "Required";
    if (!shipping.lastName.trim())  e.lastName  = "Required";
    if (!shipping.email.trim())     e.email     = "Required";
    else if (!/\S+@\S+\.\S+/.test(shipping.email)) e.email = "Invalid email";
    if (!shipping.address.trim())   e.address   = "Required";
    if (!shipping.city.trim())      e.city      = "Required";
    if (!shipping.zip.trim())       e.zip       = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validatePayment = () => {
    if (payment.method !== "card") return true;
    const e = {};
    if (!payment.cardNumber.trim()) e.cardNumber = "Required";
    if (!payment.cardName.trim())   e.cardName   = "Required";
    if (!payment.expiry.trim())     e.expiry     = "Required";
    if (!payment.cvv.trim())        e.cvv        = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleShippingNext = () => {
    if (validateShipping()) { setStep(3); setErrors({}); }
  };

  const handlePaymentNext = () => {
    if (validatePayment()) { setStep(4); setErrors({}); }
  };

  // ── Place real order ──
  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      // Build order items from cart
      const orderItems = items.map((item) => ({
        product:       item._id,
        name:          item.name,
        image:         item.image || "",
        price:         item.price,
        quantity:      item.quantity,
        selectedColor: item.selectedColor || "",
        selectedSize:  item.selectedSize  || "",
      }));

      const orderData = {
        items:           orderItems,
        shippingAddress: shipping,
        paymentMethod:   payment.method,
        subtotal:        total,
        shippingPrice:   shippingCost,
        taxPrice:        tax,
        discount:        0,
        totalPrice:      orderTotal,
      };

      const { data } = await ordersAPI.create(orderData);

      // Clear cart after successful order
      clear();

      toast.success("Order placed successfully!");

      // Navigate to success page with order info
      navigate("/order-success", {
        state: {
          orderNumber: data.order.orderNumber,
          orderId:     data.order._id,
          total:       data.order.totalPrice,
        },
      });
    } catch (err) {
      const message = err.response?.data?.message || "Failed to place order. Please try again.";
      toast.error(message);
      console.error("Order error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── Empty cart guard ──
  if (items.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart size={28} className="text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 text-sm mb-6">
            Add some products before checking out.
          </p>
          <Link to="/products" className="btn-primary inline-flex items-center gap-2">
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  // ── Order summary sidebar ──
  const OrderSummary = () => (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Order summary</h3>

      {/* Items */}
      <div className="space-y-3 mb-4 max-h-56 overflow-y-auto">
        {items.map((item) => (
          <div key={item.cartKey} className="flex gap-3">
            <div className="w-12 h-12 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <ShoppingCart size={14} className="text-gray-300" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-800 line-clamp-1">{item.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Qty: {item.quantity}
                {item.selectedColor && ` · ${item.selectedColor}`}
              </p>
            </div>
            <p className="text-xs font-semibold text-gray-900 shrink-0">
              {formatPrice(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t border-gray-100 pt-3 space-y-2.5 text-sm">
        <div className="flex justify-between text-gray-500">
          <span>Subtotal ({count} items)</span>
          <span>{formatPrice(total)}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Shipping</span>
          <span className={shippingCost === 0 ? "text-green-600 font-medium" : ""}>
            {shippingCost === 0 ? "Free" : formatPrice(shippingCost)}
          </span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Tax (8%)</span>
          <span>{formatPrice(tax)}</span>
        </div>
        <div className="border-t border-gray-100 pt-2.5 flex justify-between font-bold text-gray-900 text-base">
          <span>Total</span>
          <span>{formatPrice(orderTotal)}</span>
        </div>
      </div>

      {shippingCost > 0 && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-3">
          Add {formatPrice(75 - total)} more for free shipping
        </p>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400">
        <Lock size={11} className="text-primary-400 shrink-0" />
        Secured with 256-bit SSL encryption
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/"
              className="text-xl font-bold text-gray-900 tracking-tight"
            >
              Shop<span className="text-primary-600">Verse</span>
            </Link>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Shield size={13} className="text-green-500" />
              Secure checkout
            </div>
          </div>
          <StepIndicator currentStep={step} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8 items-start">

          {/* ── Left form area ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* ── Shipping ── */}
            {step === 2 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <Truck size={18} className="text-primary-600" />
                  Shipping information
                </h2>

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <InputField
                    label="First name"
                    placeholder="John"
                    value={shipping.firstName}
                    onChange={(e) => updateShipping("firstName", e.target.value)}
                    error={errors.firstName}
                  />
                  <InputField
                    label="Last name"
                    placeholder="Smith"
                    value={shipping.lastName}
                    onChange={(e) => updateShipping("lastName", e.target.value)}
                    error={errors.lastName}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <InputField
                    label="Email address"
                    type="email"
                    placeholder="john@example.com"
                    value={shipping.email}
                    onChange={(e) => updateShipping("email", e.target.value)}
                    error={errors.email}
                  />
                  <InputField
                    label="Phone number"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={shipping.phone}
                    onChange={(e) => updateShipping("phone", e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <InputField
                    label="Street address"
                    placeholder="123 Main Street, Apt 4B"
                    value={shipping.address}
                    onChange={(e) => updateShipping("address", e.target.value)}
                    error={errors.address}
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-4 mb-4">
                  <InputField
                    label="City"
                    placeholder="New York"
                    value={shipping.city}
                    onChange={(e) => updateShipping("city", e.target.value)}
                    error={errors.city}
                  />
                  <InputField
                    label="State / Province"
                    placeholder="NY"
                    value={shipping.state}
                    onChange={(e) => updateShipping("state", e.target.value)}
                  />
                  <InputField
                    label="ZIP / Postal code"
                    placeholder="10001"
                    value={shipping.zip}
                    onChange={(e) => updateShipping("zip", e.target.value)}
                    error={errors.zip}
                  />
                </div>

                <div className="mb-6">
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                    Country
                  </label>
                  <div className="relative">
                    <select
                      value={shipping.country}
                      onChange={(e) => updateShipping("country", e.target.value)}
                      className="input-field appearance-none pr-10 cursor-pointer"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown
                      size={15}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                </div>

                {/* Shipping method */}
                <div className="mb-6">
                  <p className="text-xs font-semibold text-gray-700 mb-3">
                    Shipping method
                  </p>
                  <div className="space-y-2.5">
                    {[
                      {
                        id:    "standard",
                        label: "Standard delivery",
                        desc:  "5–7 business days",
                        price: total >= 75 ? "Free" : "$9.99",
                      },
                      {
                        id:    "express",
                        label: "Express delivery",
                        desc:  "2–3 business days",
                        price: "$19.99",
                      },
                      {
                        id:    "overnight",
                        label: "Overnight delivery",
                        desc:  "Next business day",
                        price: "$39.99",
                      },
                    ].map((method) => (
                      <label
                        key={method.id}
                        className="flex items-center gap-3 p-3.5 border border-gray-200 rounded-xl cursor-pointer hover:border-primary-300 transition-colors has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50"
                      >
                        <input
                          type="radio"
                          name="shipping"
                          defaultChecked={method.id === "standard"}
                          className="accent-primary-600"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800">
                            {method.label}
                          </p>
                          <p className="text-xs text-gray-500">{method.desc}</p>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {method.price}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <Link
                    to="/cart"
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <ChevronRight size={15} className="rotate-180" />
                    Back to cart
                  </Link>
                  <button
                    onClick={handleShippingNext}
                    className="btn-primary flex items-center gap-2"
                  >
                    Continue to payment
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* ── Payment ── */}
            {step === 3 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <CreditCard size={18} className="text-primary-600" />
                  Payment details
                </h2>

                {/* Payment method tabs */}
                <div className="flex gap-2 mb-6">
                  {[
                    { id: "card",   label: "Credit / Debit card" },
                    { id: "paypal", label: "PayPal"              },
                    { id: "stripe", label: "Stripe"              },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => updatePayment("method", m.id)}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        payment.method === m.id
                          ? "border-primary-600 bg-primary-50 text-primary-700"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {payment.method === "card" && (
                  <div className="space-y-4">
                    <InputField
                      label="Cardholder name"
                      placeholder="John Smith"
                      value={payment.cardName}
                      onChange={(e) => updatePayment("cardName", e.target.value)}
                      error={errors.cardName}
                    />
                    <InputField
                      label="Card number"
                      placeholder="1234  5678  9012  3456"
                      value={payment.cardNumber}
                      onChange={(e) =>
                        updatePayment("cardNumber", formatCard(e.target.value))
                      }
                      error={errors.cardNumber}
                      maxLength={19}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <InputField
                        label="Expiry date"
                        placeholder="MM / YY"
                        value={payment.expiry}
                        onChange={(e) =>
                          updatePayment("expiry", formatExpiry(e.target.value))
                        }
                        error={errors.expiry}
                        maxLength={5}
                      />
                      <InputField
                        label="CVV"
                        placeholder="123"
                        value={payment.cvv}
                        onChange={(e) =>
                          updatePayment(
                            "cvv",
                            e.target.value.replace(/\D/g, "").slice(0, 4)
                          )
                        }
                        error={errors.cvv}
                        maxLength={4}
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={payment.saveCard}
                        onChange={(e) => updatePayment("saveCard", e.target.checked)}
                        className="accent-primary-600 w-4 h-4"
                      />
                      <span className="text-sm text-gray-600">
                        Save card for future purchases
                      </span>
                    </label>
                  </div>
                )}

                {payment.method === "paypal" && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                    <p className="text-sm text-gray-500 mb-3">
                      You will be redirected to PayPal to complete your payment.
                    </p>
                    <div className="inline-block bg-[#003087] text-white text-sm font-bold px-8 py-3 rounded-xl">
                      Pay<span className="text-[#009cde]">Pal</span>
                    </div>
                  </div>
                )}

                {payment.method === "stripe" && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                    <p className="text-sm text-gray-500 mb-3">
                      You will be redirected to Stripe to complete your payment.
                    </p>
                    <div className="inline-block bg-[#635bff] text-white text-sm font-bold px-8 py-3 rounded-xl">
                      Pay with Stripe
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-5 mt-5 border-t border-gray-100">
                  <button
                    onClick={() => setStep(2)}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <ChevronRight size={15} className="rotate-180" />
                    Back to shipping
                  </button>
                  <button
                    onClick={handlePaymentNext}
                    className="btn-primary flex items-center gap-2"
                  >
                    Review order
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* ── Review + Place order ── */}
            {step === 4 && (
              <div className="space-y-4">
                {/* Shipping summary */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Truck size={15} className="text-primary-600" />
                      Shipping to
                    </h3>
                    <button
                      onClick={() => setStep(2)}
                      className="text-xs text-primary-600 hover:text-primary-800 font-medium transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="text-sm text-gray-600 space-y-0.5">
                    <p className="font-medium text-gray-900">
                      {shipping.firstName} {shipping.lastName}
                    </p>
                    <p>{shipping.address}</p>
                    <p>
                      {shipping.city}
                      {shipping.state && `, ${shipping.state}`} {shipping.zip}
                    </p>
                    <p>{shipping.country}</p>
                    <p className="text-gray-400 text-xs mt-1">{shipping.email}</p>
                  </div>
                </div>

                {/* Payment summary */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <CreditCard size={15} className="text-primary-600" />
                      Payment method
                    </h3>
                    <button
                      onClick={() => setStep(3)}
                      className="text-xs text-primary-600 hover:text-primary-800 font-medium transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 capitalize">
                    {payment.method === "card"
                      ? `Card ending in ${
                          payment.cardNumber.replace(/\s/g, "").slice(-4) || "****"
                        }`
                      : payment.method}
                  </p>
                </div>

                {/* Items summary */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <ShoppingCart size={15} className="text-primary-600" />
                    Order items ({count})
                  </h3>
                  <div className="space-y-2.5">
                    {items.map((item) => (
                      <div
                        key={item.cartKey}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden shrink-0">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingCart size={12} className="text-gray-300" />
                              </div>
                            )}
                          </div>
                          <span className="text-gray-700 line-clamp-1 max-w-[200px]">
                            {item.name}
                          </span>
                          <span className="text-gray-400 text-xs shrink-0">
                            × {item.quantity}
                          </span>
                        </div>
                        <span className="font-semibold text-gray-900 shrink-0 ml-2">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Place order */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                    By placing your order you agree to ShopVerse's{" "}
                    <a href="#" className="text-primary-600 underline">
                      Terms of service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-primary-600 underline">
                      Privacy policy
                    </a>
                    . Your payment is processed securely.
                  </p>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-800 disabled:bg-primary-400 text-white font-bold py-4 rounded-xl transition-colors text-base"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Placing order...
                      </>
                    ) : (
                      <>
                        <Lock size={16} />
                        Place order — {formatPrice(orderTotal)}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Right — Order summary ── */}
          <div>
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;