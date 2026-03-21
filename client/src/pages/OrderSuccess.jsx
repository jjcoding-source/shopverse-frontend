import { useLocation, Link } from "react-router-dom";
import {
  CheckCircle, Package, Truck, Mail,
  ArrowRight, ShoppingBag, Download,
} from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";

const OrderSuccess = () => {
  const location   = useLocation();
  const orderNumber = location.state?.orderNumber || `SV-${Date.now().toString().slice(-8)}`;
  const orderId    = location.state?.orderId;
  const total      = location.state?.total;

  const STEPS = [
    { icon: CheckCircle, label: "Order confirmed",   desc: "We have received your order",    done: true  },
    { icon: Package,     label: "Preparing order",   desc: "Being packed in our warehouse",  done: false },
    { icon: Truck,       label: "Out for delivery",  desc: "On its way to you",              done: false },
    { icon: CheckCircle, label: "Delivered",         desc: "Enjoy your purchase",            done: false },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">

        {/* Success icon */}
        <div className="relative inline-flex mb-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle size={48} className="text-green-500" />
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
            <ShoppingBag size={14} className="text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Order confirmed!
        </h1>
        <p className="text-gray-500 text-base mb-2">
          Thank you for shopping with ShopVerse.
        </p>
        <p className="text-gray-400 text-sm mb-8">
          A confirmation email has been sent to your inbox.
        </p>

        {/* Order number card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 text-left">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Order number</p>
              <p className="text-lg font-bold text-primary-600">#{orderNumber}</p>
            </div>
            <button className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-primary-600 border border-gray-200 hover:border-primary-300 px-3 py-2 rounded-lg transition-colors">
              <Download size={13} />
              Receipt
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-400 mb-1">Estimated delivery</p>
              <p className="text-sm font-semibold text-gray-800">
                {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
                  month: "short", day: "numeric",
                })} — {new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Shipping</p>
              <p className="text-sm font-semibold text-gray-800">Standard</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Total paid</p>
              <p className="text-sm font-semibold text-gray-800">
                {total ? formatPrice(total) : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Tracking progress */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4 text-left flex items-center gap-2">
            <Truck size={15} className="text-primary-600" />
            Order status
          </h3>
          <div className="relative">
            <div className="absolute left-4 top-5 bottom-5 w-0.5 bg-gray-100" />
            <div className="space-y-4">
              {STEPS.map(({ icon: Icon, label, desc, done }, i) => (
                <div key={label} className="flex items-center gap-4 relative">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center z-10 shrink-0 ${
                      done
                        ? "bg-green-500 text-white"
                        : i === 1
                        ? "bg-primary-100 border-2 border-primary-400 text-primary-600"
                        : "bg-gray-100 text-gray-300"
                    }`}
                  >
                    <Icon size={14} />
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-semibold ${
                      done || i === 1 ? "text-gray-900" : "text-gray-400"
                    }`}>
                      {label}
                    </p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                  {done && (
                    <span className="ml-auto text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      Done
                    </span>
                  )}
                  {i === 1 && (
                    <span className="ml-auto text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                      In progress
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Email note */}
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 text-left">
          <Mail size={18} className="text-blue-500 shrink-0" />
          <p className="text-sm text-blue-700">
            A detailed order confirmation with tracking info has been sent to your email address.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/orders"
            className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-800 text-white font-semibold px-7 py-3 rounded-xl transition-colors"
          >
            <Package size={16} />
            Track my order
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 border border-gray-200 hover:border-primary-300 text-gray-700 hover:text-primary-600 font-medium px-7 py-3 rounded-xl transition-colors"
          >
            Continue shopping
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;