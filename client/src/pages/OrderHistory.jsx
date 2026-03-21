import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Package, Truck, CheckCircle, Clock,
  XCircle, ChevronRight, Download,
  Star, ShoppingBag, X, RefreshCw,
} from "lucide-react";
import { ordersAPI }   from "@/store/api/ordersApi";
import { formatPrice } from "@/utils/formatPrice";
import Loader          from "@/components/common/Loader";
import toast           from "react-hot-toast";

const STATUS_CONFIG = {
  processing: { label: "Processing", color: "bg-primary-50 text-primary-600",  icon: Clock,        step: 1 },
  packed:     { label: "Packed",     color: "bg-blue-50 text-blue-600",        icon: Package,      step: 2 },
  shipped:    { label: "Shipped",    color: "bg-indigo-50 text-indigo-600",    icon: Truck,        step: 3 },
  transit:    { label: "In transit", color: "bg-amber-50 text-amber-600",      icon: Truck,        step: 4 },
  delivered:  { label: "Delivered",  color: "bg-green-50 text-green-600",      icon: CheckCircle,  step: 5 },
  cancelled:  { label: "Cancelled",  color: "bg-red-50 text-red-500",          icon: XCircle,      step: 0 },
};

const TRACK_STEPS = [
  { label: "Order placed",     key: "processing" },
  { label: "Packed",           key: "packed"     },
  { label: "Shipped",          key: "shipped"    },
  { label: "Out for delivery", key: "transit"    },
  { label: "Delivered",        key: "delivered"  },
];

const OrderDetailModal = ({ order, onClose, onCancel }) => {
  const cfg  = STATUS_CONFIG[order.status] || STATUS_CONFIG.processing;
  const Icon = cfg.icon;
  const currentStep = cfg.step;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900">Order #{order.orderNumber}</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                weekday: "long", year: "numeric", month: "long", day: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Status badge */}
          <span className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full ${cfg.color}`}>
            <Icon size={13} />
            {cfg.label}
          </span>

          {/* Tracking steps */}
          {order.status !== "cancelled" && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Order tracking
              </p>
              <div className="flex items-center gap-0">
                {TRACK_STEPS.map((s, i) => (
                  <div key={s.key} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          i + 1 <= currentStep
                            ? "bg-primary-600 text-white"
                            : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        {i + 1 <= currentStep ? "✓" : i + 1}
                      </div>
                      <p className={`text-[9px] mt-1 text-center max-w-[48px] leading-tight ${
                        i + 1 <= currentStep ? "text-primary-600 font-semibold" : "text-gray-400"
                      }`}>
                        {s.label}
                      </p>
                    </div>
                    {i < TRACK_STEPS.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mb-4 ${
                          i + 1 < currentStep ? "bg-primary-600" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shipping address */}
          {order.shippingAddress && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Shipping address
              </p>
              <p className="text-sm text-gray-700 font-medium">
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              </p>
              <p className="text-xs text-gray-500">{order.shippingAddress.address}</p>
              <p className="text-xs text-gray-500">
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
              </p>
              <p className="text-xs text-gray-500">{order.shippingAddress.country}</p>
            </div>
          )}

          {/* Items */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Items ({order.items?.length})
            </p>
            <div className="space-y-2.5">
              {order.items?.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package size={14} className="text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 line-clamp-1">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-xs font-semibold text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Price breakdown */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Payment summary
            </p>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Shipping</span>
              <span className={order.shippingPrice === 0 ? "text-green-600 font-medium" : ""}>
                {order.shippingPrice === 0 ? "Free" : formatPrice(order.shippingPrice)}
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Tax</span>
              <span>{formatPrice(order.taxPrice)}</span>
            </div>
            <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2 mt-1">
              <span>Total</span>
              <span>{formatPrice(order.totalPrice)}</span>
            </div>
            <p className="text-xs text-gray-400 capitalize">
              Payment: {order.paymentMethod}
            </p>
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-gray-100">
          {["processing", "packed"].includes(order.status) && (
            <button
              onClick={() => { onCancel(order._id); onClose(); }}
              className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2.5 rounded-xl transition-colors text-sm"
            >
              <XCircle size={14} />
              Cancel order
            </button>
          )}
          <button
            className="flex-1 flex items-center justify-center gap-2 btn-ghost text-sm"
          >
            <Download size={14} />
            Invoice
          </button>
          <button onClick={onClose} className="flex-1 btn-primary text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const OrderHistory = () => {
  const queryClient  = useQueryClient();
  const [filter,     setFilter]     = useState("all");
  const [viewOrder,  setViewOrder]  = useState(null);
  const [currentPage,setCurrentPage]= useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["my-orders", filter, currentPage],
    queryFn:  () =>
      ordersAPI.getMyOrders({
        page:   currentPage,
        limit:  5,
        status: filter !== "all" ? filter : undefined,
      }).then((r) => r.data),
  });

  const orders     = data?.orders     || [];
  const total      = data?.total      || 0;
  const totalPages = data?.totalPages || 1;

  const handleCancel = async (id) => {
    try {
      await ordersAPI.cancel(id);
      queryClient.invalidateQueries(["my-orders"]);
      toast.success("Order cancelled successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Cannot cancel this order");
    }
  };

  const TAB_FILTERS = [
    { id: "all",        label: "All"         },
    { id: "processing", label: "Processing"  },
    { id: "transit",    label: "In transit"  },
    { id: "delivered",  label: "Delivered"   },
    { id: "cancelled",  label: "Cancelled"   },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
            <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link to="/dashboard" className="hover:text-primary-600 transition-colors">Account</Link>
            <ChevronRight size={12} />
            <span className="text-gray-700 font-medium">Order history</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Order history</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total} order{total !== 1 ? "s" : ""} placed
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Filter tabs */}
        <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 mb-5 overflow-x-auto">
          {TAB_FILTERS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setFilter(tab.id); setCurrentPage(1); }}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === tab.id
                  ? "bg-primary-600 text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders list */}
        {isLoading ? (
          <Loader text="Loading orders..." />
        ) : isError ? (
          <div className="bg-white border border-gray-100 rounded-2xl py-16 text-center">
            <p className="text-red-500 font-medium text-sm">Failed to load orders</p>
            <button
              onClick={() => queryClient.invalidateQueries(["my-orders"])}
              className="mt-3 flex items-center gap-1.5 text-xs text-primary-600 mx-auto hover:underline"
            >
              <RefreshCw size={12} />
              Try again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl py-20 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={28} className="text-gray-200" />
            </div>
            <p className="text-gray-500 font-medium mb-1">No orders found</p>
            <p className="text-sm text-gray-400 mb-6">
              {filter !== "all"
                ? "No orders with this status"
                : "You haven't placed any orders yet"}
            </p>
            <Link to="/products" className="btn-primary inline-flex items-center gap-2 text-sm">
              <ShoppingBag size={15} />
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const cfg  = STATUS_CONFIG[order.status] || STATUS_CONFIG.processing;
              const Icon = cfg.icon;
              return (
                <div
                  key={order._id}
                  className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-primary-200 hover:shadow-sm transition-all"
                >
                  {/* Order header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-gray-900">
                          #{order.orderNumber}
                        </p>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>
                          <Icon size={10} />
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric", month: "long", day: "numeric",
                        })}
                        {" · "}
                        {order.items?.length} item{order.items?.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <p className="text-base font-bold text-gray-900">
                      {formatPrice(order.totalPrice)}
                    </p>
                  </div>

                  {/* Items preview */}
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {order.items?.slice(0, 4).map((item, i) => (
                      <div
                        key={i}
                        className="w-12 h-12 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center overflow-hidden"
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package size={16} className="text-gray-200" />
                        )}
                      </div>
                    ))}
                    {order.items?.length > 4 && (
                      <div className="w-12 h-12 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center">
                        <span className="text-xs font-semibold text-gray-400">
                          +{order.items.length - 4}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => setViewOrder(order)}
                      className="flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors"
                    >
                      <Package size={12} />
                      View details
                    </button>

                    {order.status === "transit" && (
                      <button className="flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors">
                        <Truck size={12} />
                        Track shipment
                      </button>
                    )}

                    {order.status === "delivered" && (
                      order.items?.map((item) => (
                       <Link
                         key={item.product}
                         to={`/products/${item.product}?tab=reviews`}
                        className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-primary-600 transition-colors"
                       >
                        <Star size={12} />
                        Review {item.name.split(" ").slice(0, 2).join(" ")}
                      </Link>
                     ))
                    )}

                    {["processing", "packed"].includes(order.status) && (
                      <button
                        onClick={() => handleCancel(order._id)}
                        className="flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-600 transition-colors"
                      >
                        <XCircle size={12} />
                        Cancel order
                      </button>
                    )}

                    <button className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors ml-auto">
                      <Download size={12} />
                      Invoice
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                  currentPage === p
                    ? "bg-primary-600 text-white"
                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {viewOrder && (
        <OrderDetailModal
          order={viewOrder}
          onClose={() => setViewOrder(null)}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default OrderHistory;