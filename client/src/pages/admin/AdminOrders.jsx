import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search, Eye, X, Truck, CheckCircle,
  Clock, XCircle, Download, Package,
} from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import { adminAPI } from "@/store/api/adminApi";
import { ordersAPI } from "@/store/api/ordersApi";
import toast from "react-hot-toast";

const STATUS_CONFIG = {
  processing: { label: "Processing", color: "bg-primary-50 text-primary-600",  icon: Clock,        next: "packed"    },
  packed:     { label: "Packed",     color: "bg-blue-50 text-blue-600",        icon: Package,      next: "shipped"   },
  shipped:    { label: "Shipped",    color: "bg-indigo-50 text-indigo-600",    icon: Truck,        next: "transit"   },
  transit:    { label: "In transit", color: "bg-amber-50 text-amber-600",      icon: Truck,        next: "delivered" },
  delivered:  { label: "Delivered",  color: "bg-green-50 text-green-600",      icon: CheckCircle,  next: null        },
  cancelled:  { label: "Cancelled",  color: "bg-red-50 text-red-500",          icon: XCircle,      next: null        },
};

const OrderDetailModal = ({ order, onClose, onUpdateStatus }) => {
  const cfg  = STATUS_CONFIG[order.status] || STATUS_CONFIG.processing;
  const Icon = cfg.icon;

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
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full ${cfg.color}`}>
              <Icon size={13} />
              {cfg.label}
            </span>
            {cfg.next && (
              <button
                onClick={() => {
                  onUpdateStatus(order._id, cfg.next);
                  onClose();
                }}
                className="text-xs font-medium text-primary-600 hover:text-primary-800 border border-primary-200 hover:border-primary-400 px-3 py-1.5 rounded-lg transition-colors"
              >
                Mark as {STATUS_CONFIG[cfg.next]?.label}
              </button>
            )}
          </div>

          {/* Customer */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Customer
            </p>
            <p className="text-sm font-semibold text-gray-900">{order.user?.name || "Unknown"}</p>
            <p className="text-xs text-gray-500">{order.user?.email}</p>
          </div>

          {/* Shipping address */}
          {order.shippingAddress && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Shipping address
              </p>
              <p className="text-sm text-gray-700">
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
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package size={12} className="text-gray-300" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-800 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment summary */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Payment
            </p>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Method</span>
              <span className="font-medium text-gray-900 capitalize">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Shipping</span>
              <span className={order.shippingPrice === 0 ? "text-green-600 font-medium" : "text-gray-900"}>
                {order.shippingPrice === 0 ? "Free" : formatPrice(order.shippingPrice)}
              </span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Discount</span>
                <span className="text-green-600">-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2 mt-2">
              <span>Total</span>
              <span>{formatPrice(order.totalPrice)}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-gray-100">
          <button className="flex-1 flex items-center justify-center gap-2 btn-ghost text-sm">
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

const AdminOrders = () => {
  const queryClient = useQueryClient();

  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewOrder,    setViewOrder]    = useState(null);
  const [currentPage,  setCurrentPage]  = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", statusFilter, currentPage],
    queryFn:  () =>
      adminAPI.getOrders({
        page:   currentPage,
        limit:  10,
        status: statusFilter !== "all" ? statusFilter : undefined,
      }).then((r) => r.data),
  });

  const orders     = data?.orders     || [];
  const total      = data?.total      || 0;
  const totalPages = data?.totalPages || 1;

  // Client-side search filter
  const filtered = orders.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.orderNumber?.toLowerCase().includes(q) ||
      o.user?.name?.toLowerCase().includes(q)  ||
      o.user?.email?.toLowerCase().includes(q)
    );
  });

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await ordersAPI.updateStatus(id, newStatus);
      queryClient.invalidateQueries(["admin-orders"]);
      queryClient.invalidateQueries(["admin-stats"]);
      toast.success(`Order updated to ${STATUS_CONFIG[newStatus]?.label}`);
    } catch {
      toast.error("Failed to update order status");
    }
  };

  // Status counts from current data
  const statusCounts = Object.keys(STATUS_CONFIG).reduce((acc, key) => {
    acc[key] = orders.filter((o) => o.status === key).length;
    return acc;
  }, {});

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total orders</p>
        </div>
        <button className="flex items-center gap-1.5 text-sm font-medium text-gray-600 border border-gray-200 bg-white px-4 py-2 rounded-xl hover:border-gray-300 transition-colors">
          <Download size={14} />
          Export
        </button>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { id: "processing", label: "Processing", color: "bg-primary-50 text-primary-600", icon: Clock       },
          { id: "transit",    label: "In transit", color: "bg-amber-50 text-amber-600",     icon: Truck       },
          { id: "delivered",  label: "Delivered",  color: "bg-green-50 text-green-600",     icon: CheckCircle },
          { id: "cancelled",  label: "Cancelled",  color: "bg-red-50 text-red-500",         icon: XCircle     },
        ].map(({ id, label, color, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setStatusFilter(statusFilter === id ? "all" : id)}
            className={`bg-white border rounded-xl p-4 text-left transition-all hover:shadow-sm ${
              statusFilter === id ? "border-primary-300 bg-primary-50" : "border-gray-100"
            }`}
          >
            <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full mb-2 ${color}`}>
              <Icon size={11} />
              {label}
            </div>
            <p className="text-2xl font-bold text-gray-900">{statusCounts[id] || 0}</p>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 flex-1 min-w-48 max-w-80 focus-within:border-primary-400 transition-colors">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search by customer or order ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none flex-1"
            />
            {search && (
              <button onClick={() => setSearch("")}>
                <X size={13} className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="ml-auto bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 outline-none focus:border-primary-400 cursor-pointer"
          >
            <option value="all">All orders</option>
            <option value="processing">Processing</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="transit">In transit</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-16 text-center text-sm text-gray-400">
              Loading orders...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Package size={36} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium text-sm">No orders found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["Order ID", "Customer", "Date", "Items", "Total", "Payment", "Status", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((order) => {
                  const cfg  = STATUS_CONFIG[order.status] || STATUS_CONFIG.processing;
                  const Icon = cfg.icon;
                  return (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <span className="text-xs font-bold text-primary-600">
                          #{order.orderNumber}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-600 shrink-0">
                            {order.user?.name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                              {order.user?.name || "Unknown"}
                            </p>
                            <p className="text-xs text-gray-400">{order.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {order.items?.length} items
                      </td>
                      <td className="px-5 py-4 font-semibold text-gray-900">
                        {formatPrice(order.totalPrice)}
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500 capitalize whitespace-nowrap">
                        {order.paymentMethod}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>
                          <Icon size={10} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setViewOrder(order)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                          >
                            <Eye size={15} />
                          </button>
                          {cfg.next && (
                            <button
                              onClick={() => handleUpdateStatus(order._id, cfg.next)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                              title={`Mark as ${STATUS_CONFIG[cfg.next]?.label}`}
                            >
                              <CheckCircle size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Showing {filtered.length} of {total} orders
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
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
      </div>

      {viewOrder && (
        <OrderDetailModal
          order={viewOrder}
          onClose={() => setViewOrder(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
};

export default AdminOrders;