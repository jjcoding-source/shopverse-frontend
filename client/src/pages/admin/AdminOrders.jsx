import { useState } from "react";
import {
  Search, Eye, ChevronDown, X,
  Truck, CheckCircle, Clock, XCircle,
  Download, Filter, Package,
} from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import toast from "react-hot-toast";

const ORDERS = [
  { id: "SV-20250320", customer: "James Kumar",    email: "james@example.com",  items: 3, total: 760.42,  status: "processing", date: "Mar 20, 2025", payment: "Card ****3456" },
  { id: "SV-20250319", customer: "Sarah Williams", email: "sarah@example.com",  items: 1, total: 279.00,  status: "transit",    date: "Mar 19, 2025", payment: "PayPal"       },
  { id: "SV-20250318", customer: "Alex Chen",      email: "alex@example.com",   items: 5, total: 1204.00, status: "delivered",  date: "Mar 18, 2025", payment: "Card ****8821"},
  { id: "SV-20250317", customer: "Priya Nair",     email: "priya@example.com",  items: 2, total: 448.00,  status: "delivered",  date: "Mar 17, 2025", payment: "Stripe"       },
  { id: "SV-20250316", customer: "Tom Brooks",     email: "tom@example.com",    items: 1, total: 89.00,   status: "cancelled",  date: "Mar 16, 2025", payment: "Card ****1122"},
  { id: "SV-20250315", customer: "Emma Davis",     email: "emma@example.com",   items: 4, total: 532.00,  status: "transit",    date: "Mar 15, 2025", payment: "PayPal"       },
  { id: "SV-20250314", customer: "Raj Patel",      email: "raj@example.com",    items: 2, total: 318.00,  status: "delivered",  date: "Mar 14, 2025", payment: "Card ****5544"},
  { id: "SV-20250313", customer: "Lisa Wong",      email: "lisa@example.com",   items: 3, total: 627.00,  status: "processing", date: "Mar 13, 2025", payment: "Stripe"       },
];

const STATUS_CONFIG = {
  processing: { label: "Processing", color: "bg-primary-50 text-primary-600",  icon: Clock,        next: "transit"   },
  transit:    { label: "In transit", color: "bg-amber-50 text-amber-600",      icon: Truck,        next: "delivered" },
  delivered:  { label: "Delivered",  color: "bg-green-50 text-green-600",      icon: CheckCircle,  next: null        },
  cancelled:  { label: "Cancelled",  color: "bg-red-50 text-red-500",          icon: XCircle,      next: null        },
};

const OrderDetailModal = ({ order, onClose, onUpdateStatus }) => {
  const cfg  = STATUS_CONFIG[order.status];
  const Icon = cfg.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900">Order #{order.id}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{order.date}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
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
                onClick={() => { onUpdateStatus(order.id, cfg.next); onClose(); }}
                className="text-xs font-medium text-primary-600 hover:text-primary-800 border border-primary-200 hover:border-primary-400 px-3 py-1.5 rounded-lg transition-colors"
              >
                Mark as {STATUS_CONFIG[cfg.next].label}
              </button>
            )}
          </div>

          {/* Customer */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Customer</p>
            <p className="text-sm font-semibold text-gray-900">{order.customer}</p>
            <p className="text-xs text-gray-500">{order.email}</p>
          </div>

          {/* Items placeholder */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Items ({order.items})</p>
            {Array.from({ length: order.items }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                    <Package size={12} className="text-gray-300" />
                  </div>
                  <p className="text-xs text-gray-700">Product item {i + 1}</p>
                </div>
                <p className="text-xs font-semibold text-gray-900">
                  {formatPrice(order.total / order.items)}
                </p>
              </div>
            ))}
          </div>

          {/* Payment + Total */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Payment</p>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Method</span>
              <span className="font-medium text-gray-900">{order.payment}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Shipping</span>
              <span className="font-medium text-green-600">Free</span>
            </div>
            <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2 mt-2">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
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
  const [orders,      setOrders]      = useState(ORDERS);
  const [search,      setSearch]      = useState("");
  const [statusFilter,setStatusFilter]= useState("all");
  const [viewOrder,   setViewOrder]   = useState(null);

  const handleUpdateStatus = (id, newStatus) => {
    setOrders((p) => p.map((o) => o.id === id ? { ...o, status: newStatus } : o));
    toast.success(`Order updated to ${STATUS_CONFIG[newStatus].label}`);
  };

  const filtered = orders.filter((o) => {
    if (search && !o.customer.toLowerCase().includes(search.toLowerCase()) && !o.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    return true;
  });

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
          <p className="text-sm text-gray-500 mt-0.5">{orders.length} total orders</p>
        </div>
        <button className="flex items-center gap-1.5 text-sm font-medium text-gray-600 border border-gray-200 bg-white px-4 py-2 rounded-xl hover:border-gray-300 transition-colors">
          <Download size={14} />
          Export
        </button>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <button
              key={key}
              onClick={() => setStatusFilter(statusFilter === key ? "all" : key)}
              className={`bg-white border rounded-xl p-4 text-left transition-all hover:shadow-sm ${
                statusFilter === key ? "border-primary-300 bg-primary-50" : "border-gray-100"
              }`}
            >
              <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full mb-2 ${cfg.color}`}>
                <Icon size={11} />
                {cfg.label}
              </div>
              <p className="text-2xl font-bold text-gray-900">{statusCounts[key]}</p>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 flex-1 min-w-48 max-w-72 focus-within:border-primary-400 transition-colors">
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
            onChange={(e) => setStatusFilter(e.target.value)}
            className="ml-auto bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 outline-none focus:border-primary-400 cursor-pointer"
          >
            <option value="all">All orders</option>
            <option value="processing">Processing</option>
            <option value="transit">In transit</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Order ID", "Customer", "Date", "Items", "Total", "Payment", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((order) => {
                const cfg  = STATUS_CONFIG[order.status];
                const Icon = cfg.icon;
                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="text-xs font-bold text-primary-600">#{order.id}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-600 shrink-0">
                          {order.customer.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">{order.customer}</p>
                          <p className="text-xs text-gray-400">{order.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">{order.date}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{order.items}</td>
                    <td className="px-5 py-4 font-semibold text-gray-900">{formatPrice(order.total)}</td>
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">{order.payment}</td>
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
                        {STATUS_CONFIG[order.status].next && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, STATUS_CONFIG[order.status].next)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
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

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <Package size={36} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium text-sm">No orders found</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Showing {filtered.length} of {orders.length} orders
          </p>
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