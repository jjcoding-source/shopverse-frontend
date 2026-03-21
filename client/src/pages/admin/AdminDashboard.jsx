import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp, ShoppingBag, Users, Package,
  ArrowUp, ArrowDown, Eye, ChevronRight,
  CheckCircle, Clock, Truck, XCircle, RefreshCw,
} from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import { adminAPI } from "@/store/api/adminApi";

const STATUS_CONFIG = {
  processing: { label: "Processing", color: "bg-primary-50 text-primary-600",  icon: Clock       },
  packed:     { label: "Packed",     color: "bg-blue-50 text-blue-600",        icon: Package     },
  shipped:    { label: "Shipped",    color: "bg-indigo-50 text-indigo-600",    icon: Truck       },
  transit:    { label: "In transit", color: "bg-amber-50 text-amber-600",      icon: Truck       },
  delivered:  { label: "Delivered",  color: "bg-green-50 text-green-600",      icon: CheckCircle },
  cancelled:  { label: "Cancelled",  color: "bg-red-50 text-red-500",          icon: XCircle     },
};

const AdminDashboard = () => {
  const [period, setPeriod] = useState("monthly");

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn:  () => adminAPI.getStats().then((r) => r.data),
  });

  const { data: revenueData } = useQuery({
    queryKey: ["admin-revenue"],
    queryFn:  () => adminAPI.getRevenue().then((r) => r.data),
  });

  const stats        = statsData?.stats        || {};
  const recentOrders = statsData?.recentOrders || [];
  const topProducts  = statsData?.topProducts  || [];
  const monthlyRevenue = revenueData?.monthlyRevenue || [];

  // Build bar chart data from API
  const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonth = new Date().getMonth() + 1;

  const revenueBarData = monthlyRevenue.slice(-6).map((item, idx, arr) => ({
    month:   MONTH_NAMES[(item._id.month - 1)],
    amount:  item.revenue,
    value:   Math.round((item.revenue / Math.max(...arr.map((x) => x.revenue))) * 100),
    current: item._id.month === currentMonth,
  }));

  // Order status counts
  const statusCounts = {
    processing: recentOrders.filter((o) => o.status === "processing").length,
    transit:    recentOrders.filter((o) => o.status === "transit").length,
    delivered:  recentOrders.filter((o) => o.status === "delivered").length,
    cancelled:  recentOrders.filter((o) => o.status === "cancelled").length,
  };

  const STATS_CARDS = [
    {
      label: "Total revenue",
      value: statsLoading ? "..." : formatPrice(stats.totalRevenue || 0),
      change: "+18.4%",
      up:    true,
      sub:   "vs last month",
      icon:  TrendingUp,
      color: "bg-primary-50 text-primary-600",
    },
    {
      label: "Total orders",
      value: statsLoading ? "..." : (stats.totalOrders || 0).toLocaleString(),
      change: "+12.1%",
      up:    true,
      sub:   "vs last month",
      icon:  ShoppingBag,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Total customers",
      value: statsLoading ? "..." : (stats.totalUsers || 0).toLocaleString(),
      change: "+7.8%",
      up:    true,
      sub:   "vs last month",
      icon:  Users,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Total products",
      value: statsLoading ? "..." : (stats.totalProducts || 0).toLocaleString(),
      change: "+4.2%",
      up:    true,
      sub:   "Active listings",
      icon:  Package,
      color: "bg-blue-50 text-blue-600",
    },
  ];

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
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
        {STATS_CARDS.map(({ label, value, change, up, sub, icon: Icon, color }) => (
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
              <p className="text-xl font-bold text-gray-900">
                {formatPrice(stats.totalRevenue || 0)}
              </p>
              <p className="text-xs text-green-600 flex items-center justify-end gap-1">
                <ArrowUp size={11} /> 18.4% this month
              </p>
            </div>
          </div>

          {revenueBarData.length > 0 ? (
            <div className="flex items-end gap-3 h-40">
              {revenueBarData.map((bar) => (
                <div key={bar.month} className="flex-1 flex flex-col items-center gap-2">
                  <p className="text-xs font-semibold text-gray-500">
                    ${(bar.amount / 1000).toFixed(0)}k
                  </p>
                  <div className="w-full flex flex-col justify-end" style={{ height: "100px" }}>
                    <div
                      className={`w-full rounded-t-lg transition-all ${
                        bar.current ? "bg-primary-600" : "bg-primary-100"
                      }`}
                      style={{ height: `${Math.max(bar.value, 5)}%` }}
                    />
                  </div>
                  <p className={`text-xs font-medium ${bar.current ? "text-primary-600" : "text-gray-400"}`}>
                    {bar.month}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-300 text-sm">
              No revenue data yet
            </div>
          )}

          {/* Order status breakdown */}
          <div className="grid grid-cols-4 gap-3 mt-6 pt-5 border-t border-gray-100">
            {[
              { label: "Processing", value: statusCounts.processing, color: "bg-primary-600" },
              { label: "In transit", value: statusCounts.transit,    color: "bg-amber-400"   },
              { label: "Delivered",  value: statusCounts.delivered,  color: "bg-green-500"   },
              { label: "Cancelled",  value: statusCounts.cancelled,  color: "bg-red-400"     },
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

          {topProducts.length === 0 ? (
            <div className="py-8 text-center text-gray-300 text-sm">
              No products data yet
            </div>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product, i) => (
                <div key={product._id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-300 w-4 shrink-0">
                    {i + 1}
                  </span>
                  <div className="w-9 h-9 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                    {product.images?.[0]?.url ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package size={14} className="text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 line-clamp-1">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-400">{product.sold || 0} sold</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </p>
                    <p className="text-xs text-gray-400">
                      ★ {product.rating?.toFixed(1) || "0.0"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
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

        {statsLoading ? (
          <div className="py-12 text-center text-sm text-gray-400">
            Loading orders...
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            No orders yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["Order ID", "Customer", "Items", "Date", "Total", "Status", "Action"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => {
                  const cfg  = STATUS_CONFIG[order.status] || STATUS_CONFIG.processing;
                  const Icon = cfg.icon;
                  return (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-bold text-primary-600">
                          #{order.orderNumber}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-600 shrink-0">
                            {order.user?.name?.charAt(0) || "U"}
                          </div>
                          <span className="text-sm text-gray-800 whitespace-nowrap">
                            {order.user?.name || "Unknown"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs">
                        {order.items?.length} items
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-gray-900">
                        {formatPrice(order.totalPrice)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>
                          <Icon size={10} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link
                          to="/admin/orders"
                          className="text-gray-400 hover:text-primary-600 transition-colors"
                        >
                          <Eye size={15} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;