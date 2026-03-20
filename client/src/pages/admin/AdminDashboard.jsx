import { useState } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp, ShoppingBag, Users, Package,
  ArrowUp, ArrowDown, Eye, MoreHorizontal,
  CheckCircle, Clock, Truck, XCircle,
  ChevronRight, RefreshCw,
} from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";

const STATS = [
  {
    label:   "Total revenue",
    value:   "$84,231",
    change:  "+18.4%",
    up:      true,
    sub:     "vs last month",
    icon:    TrendingUp,
    color:   "bg-primary-50 text-primary-600",
  },
  {
    label:   "Total orders",
    value:   "1,248",
    change:  "+12.1%",
    up:      true,
    sub:     "vs last month",
    icon:    ShoppingBag,
    color:   "bg-green-50 text-green-600",
  },
  {
    label:   "New customers",
    value:   "342",
    change:  "+7.8%",
    up:      true,
    sub:     "vs last month",
    icon:    Users,
    color:   "bg-amber-50 text-amber-600",
  },
  {
    label:   "Return rate",
    value:   "2.4%",
    change:  "+0.3%",
    up:      false,
    sub:     "vs target",
    icon:    RefreshCw,
    color:   "bg-red-50 text-red-500",
  },
];

const RECENT_ORDERS = [
  { id: "SV-20250320", customer: "James Kumar",    items: 3, total: 760.42, status: "processing", date: "Today, 10:42" },
  { id: "SV-20250319", customer: "Sarah Williams", items: 1, total: 279.00, status: "transit",    date: "Yesterday"   },
  { id: "SV-20250318", customer: "Alex Chen",      items: 5, total: 1204.00,status: "delivered",  date: "Mar 18"      },
  { id: "SV-20250317", customer: "Priya Nair",     items: 2, total: 448.00, status: "delivered",  date: "Mar 17"      },
  { id: "SV-20250316", customer: "Tom Brooks",     items: 1, total: 89.00,  status: "cancelled",  date: "Mar 16"      },
  { id: "SV-20250315", customer: "Emma Davis",     items: 4, total: 532.00, status: "transit",    date: "Mar 15"      },
];

const TOP_PRODUCTS = [
  { name: "Sony WH-1000XM5",      category: "Electronics", sold: 482, revenue: 134478, stock: 24  },
  { name: "Apple Watch Series 10", category: "Electronics", sold: 306, revenue: 122094, stock: 8   },
  { name: "Galaxy S25 Ultra",      category: "Electronics", sold: 198, revenue: 168102, stock: 15  },
  { name: "MacBook Air M3",        category: "Electronics", sold: 87,  revenue: 95613,  stock: 5   },
  { name: "Urban Runner Sneakers", category: "Fashion",     sold: 654, revenue: 41856,  stock: 120 },
];

const REVENUE_BARS = [
  { month: "Oct", value: 52, amount: 52000 },
  { month: "Nov", value: 68, amount: 68000 },
  { month: "Dec", value: 95, amount: 95000 },
  { month: "Jan", value: 58, amount: 58000 },
  { month: "Feb", value: 72, amount: 72000 },
  { month: "Mar", value: 84, amount: 84231, current: true },
];

const STATUS_CONFIG = {
  processing: { label: "Processing", color: "bg-primary-50 text-primary-600", icon: Clock       },
  transit:    { label: "In transit", color: "bg-amber-50 text-amber-600",     icon: Truck       },
  delivered:  { label: "Delivered",  color: "bg-green-50 text-green-600",     icon: CheckCircle },
  cancelled:  { label: "Cancelled",  color: "bg-red-50 text-red-500",         icon: XCircle     },
};

const AdminDashboard = () => {
  const [period, setPeriod] = useState("monthly");

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Overview for March 2025</p>
        </div>
        <div className="flex items-center gap-2">
          {["daily", "weekly", "monthly", "yearly"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                period === p
                  ? "bg-primary-600 text-white"
                  : "bg-white border border-gray-200 text-gray-500 hover:border-primary-300"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(({ label, value, change, up, sub, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={18} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold ${up ? "text-green-600" : "text-red-500"}`}>
                {up ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                {change}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-0.5">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart + top products */}
      <div className="grid lg:grid-cols-5 gap-5">

        {/* Revenue chart */}
        <div className="lg:col-span-3 bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900">Revenue overview</h3>
              <p className="text-xs text-gray-400 mt-0.5">Last 6 months</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-gray-900">$84,231</p>
              <p className="text-xs text-green-600 flex items-center justify-end gap-1">
                <ArrowUp size={11} /> 18.4% this month
              </p>
            </div>
          </div>

          {/* Bar chart */}
          <div className="flex items-end gap-3 h-40">
            {REVENUE_BARS.map((bar) => (
              <div key={bar.month} className="flex-1 flex flex-col items-center gap-2">
                <p className="text-xs font-semibold text-gray-500">
                  ${(bar.amount / 1000).toFixed(0)}k
                </p>
                <div className="w-full flex flex-col justify-end" style={{ height: "100px" }}>
                  <div
                    className={`w-full rounded-t-lg transition-all ${
                      bar.current ? "bg-primary-600" : "bg-primary-100"
                    }`}
                    style={{ height: `${bar.value}%` }}
                  />
                </div>
                <p className={`text-xs font-medium ${bar.current ? "text-primary-600" : "text-gray-400"}`}>
                  {bar.month}
                </p>
              </div>
            ))}
          </div>

          {/* Order status breakdown */}
          <div className="grid grid-cols-4 gap-3 mt-6 pt-5 border-t border-gray-100">
            {[
              { label: "Processing", value: 142, color: "bg-primary-600" },
              { label: "In transit", value: 398, color: "bg-amber-400"   },
              { label: "Delivered",  value: 658, color: "bg-green-500"   },
              { label: "Cancelled",  value: 50,  color: "bg-red-400"     },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className={`w-2 h-2 rounded-full ${s.color} mx-auto mb-1.5`} />
                <p className="text-sm font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top products */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-900">Top products</h3>
            <Link
              to="/admin/products"
              className="text-xs text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1"
            >
              View all <ChevronRight size={13} />
            </Link>
          </div>
          <div className="space-y-4">
            {TOP_PRODUCTS.map((product, i) => (
              <div key={product.name} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-300 w-4 shrink-0">
                  {i + 1}
                </span>
                <div className="w-9 h-9 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center shrink-0">
                  <Package size={14} className="text-gray-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 line-clamp-1">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-400">{product.sold} sold</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-gray-900">
                    ${(product.revenue / 1000).toFixed(1)}k
                  </p>
                  <p className={`text-xs ${product.stock < 10 ? "text-red-500" : "text-gray-400"}`}>
                    {product.stock} left
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Recent orders</h3>
          <Link
            to="/admin/orders"
            className="text-xs text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1"
          >
            View all <ChevronRight size={13} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Order ID", "Customer", "Items", "Date", "Total", "Status", "Action"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {RECENT_ORDERS.map((order) => {
                const cfg  = STATUS_CONFIG[order.status];
                const Icon = cfg.icon;
                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-bold text-primary-600">#{order.id}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-600 shrink-0">
                          {order.customer.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-800 whitespace-nowrap">{order.customer}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">{order.items} items</td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">{order.date}</td>
                    <td className="px-5 py-3.5 font-semibold text-gray-900">{formatPrice(order.total)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>
                        <Icon size={10} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button className="text-gray-400 hover:text-primary-600 transition-colors">
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;