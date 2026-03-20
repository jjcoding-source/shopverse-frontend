import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  Tag,
  ChevronRight,
  Package,
  RefreshCw,
  Shield,
  X,
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/utils/formatPrice";
import ProductCard from "@/components/product/ProductCard";
import toast from "react-hot-toast";

const SUGGESTED = [
  { _id: "6",  name: "Bose QuietComfort Ultra Earbuds",      price: 179,  originalPrice: null, category: "electronics", rating: 4.6, reviewCount: 1420, stock: 8,  isNew: false, isFeatured: false, images: [] },
  { _id: "5",  name: "Smart Watch Series X Fitness Tracker", price: 149,  originalPrice: 229,  category: "electronics", rating: 4.9, reviewCount: 4312, stock: 15, isNew: false, isFeatured: true,  images: [] },
  { _id: "8",  name: "Ceramic Pour-Over Coffee Set",         price: 38,   originalPrice: null, category: "home",        rating: 4.7, reviewCount: 219,  stock: 12, isNew: false, isFeatured: false, images: [] },
  { _id: "3",  name: "Urban Runner Sneakers",                price: 64,   originalPrice: 80,   category: "fashion",     rating: 4.7, reviewCount: 876,  stock: 20, isNew: true,  isFeatured: false, images: [] },
];

const PROMO_CODES = {
  SUMMER50: 50,
  SAVE20:   20,
  WELCOME10: 10,
};

const CartItem = ({ item, onRemove, onUpdateQty }) => (
  <div className="flex gap-4 py-5 border-b border-gray-100 last:border-0">
    {/* Image */}
    <div className="w-24 h-24 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
      {item.image ? (
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
      ) : (
        <ShoppingCart size={24} className="text-gray-200" />
      )}
    </div>

    {/* Info */}
    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-primary-600 uppercase tracking-wider mb-0.5">
            {item.category || "Product"}
          </p>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
            {item.name}
          </h3>
        </div>
        <button
          onClick={() => onRemove(item.cartKey)}
          className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors shrink-0"
        >
          <X size={15} />
        </button>
      </div>

      {item.selectedColor && (
        <p className="text-xs text-gray-400">
          Color: {item.selectedColor}
        </p>
      )}
      {item.selectedSize && (
        <p className="text-xs text-gray-400">
          Size: {item.selectedSize}
        </p>
      )}

      <div className="flex items-center justify-between mt-auto pt-1">
        {/* Quantity control */}
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => onUpdateQty(item.cartKey, item.quantity - 1)}
            className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <Minus size={12} />
          </button>
          <span className="w-10 h-8 flex items-center justify-center text-sm font-semibold text-gray-900 border-x border-gray-200">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQty(item.cartKey, item.quantity + 1)}
            className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <Plus size={12} />
          </button>
        </div>

        {/* Price */}
        <div className="text-right">
          <p className="text-sm font-bold text-gray-900">
            {formatPrice(item.price * item.quantity)}
          </p>
          {item.quantity > 1 && (
            <p className="text-xs text-gray-400">
              {formatPrice(item.price)} each
            </p>
          )}
        </div>
      </div>
    </div>
  </div>
);

const Cart = () => {
  const { items, total, count, removeItem, updateQty, clear } = useCart();

  const [promoCode,    setPromoCode]    = useState("");
  const [promoApplied, setPromoApplied] = useState(null);
  const [promoError,   setPromoError]   = useState("");

  const discount    = promoApplied ? (total * promoApplied) / 100 : 0;
  const shipping    = total >= 75 ? 0 : 9.99;
  const tax         = (total - discount) * 0.08;
  const orderTotal  = total - discount + shipping + tax;

  const handlePromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (PROMO_CODES[code]) {
      setPromoApplied(PROMO_CODES[code]);
      setPromoError("");
      toast.success(`Promo code applied — ${PROMO_CODES[code]}% off`);
    } else {
      setPromoError("Invalid promo code. Try SUMMER50, SAVE20 or WELCOME10.");
      setPromoApplied(null);
    }
  };

  const handleRemove = (key) => {
    removeItem(key);
    toast.success("Item removed from cart");
  };

  if (items.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <ShoppingCart size={32} className="text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 text-sm mb-8 max-w-xs mx-auto">
            Looks like you haven't added anything yet. Start browsing and find something you love.
          </p>
          <Link to="/products" className="btn-primary inline-flex items-center gap-2">
            <ShoppingCart size={16} />
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Shopping cart</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {count} item{count !== 1 ? "s" : ""} in your cart
              </p>
            </div>
            <button
              onClick={() => { clear(); toast.success("Cart cleared"); }}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={14} />
              Clear cart
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-3 gap-6 items-start">

          {/* ── Cart items ── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 px-5">
              {items.map((item) => (
                <CartItem
                  key={item.cartKey}
                  item={item}
                  onRemove={handleRemove}
                  onUpdateQty={updateQty}
                />
              ))}
            </div>

            {/* Continue shopping */}
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors"
            >
              <ChevronRight size={15} className="rotate-180" />
              Continue shopping
            </Link>
          </div>

          {/* ── Order summary ── */}
          <div className="space-y-4 sticky top-24">
            {/* Promo code */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Tag size={15} className="text-primary-600" />
                Promo code
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value);
                    setPromoError("");
                  }}
                  className="input-field flex-1 uppercase"
                />
                <button
                  onClick={handlePromo}
                  className="btn-primary px-4 shrink-0"
                >
                  Apply
                </button>
              </div>
              {promoError && (
                <p className="text-xs text-red-500 mt-2">{promoError}</p>
              )}
              {promoApplied && (
                <div className="flex items-center justify-between mt-2 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                  <p className="text-xs font-medium text-green-700">
                    {promoApplied}% discount applied
                  </p>
                  <button
                    onClick={() => { setPromoApplied(null); setPromoCode(""); }}
                    className="text-green-500 hover:text-green-700"
                  >
                    <X size={13} />
                  </button>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Order summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({count} items)</span>
                  <span>{formatPrice(total)}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({promoApplied}%)</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>
                    {shipping === 0 ? "Free" : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Estimated tax</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900 text-base">
                  <span>Total</span>
                  <span>{formatPrice(orderTotal)}</span>
                </div>
              </div>

              {shipping > 0 && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-3">
                  Add {formatPrice(75 - total)} more for free shipping
                </p>
              )}

              <Link
                to="/checkout"
                className="w-full mt-4 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-800 text-white font-semibold py-3.5 rounded-xl transition-colors"
              >
                Proceed to checkout
                <ArrowRight size={16} />
              </Link>

              {/* Trust badges */}
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                {[
                  { icon: Shield,   text: "SSL encrypted & secure checkout" },
                  { icon: RefreshCw, text: "Free 30-day returns" },
                  { icon: Package,  text: "Tracked & insured delivery" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-xs text-gray-400">
                    <Icon size={12} className="text-primary-400 shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Suggested products */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-5">
            You might also like
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {SUGGESTED.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;