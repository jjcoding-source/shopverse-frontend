import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp, ShoppingBag, Users, Package,
  ArrowUp, ArrowDown, Star, AlertCircle,
  DollarSign, BarChart2, RefreshCw,
} from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import { adminAPI } from "@/store/api/adminApi";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const COLORS = [
  "bg-primary-600", "bg-amber-500", "bg-green-500",
  "bg-pink-500", "bg-blue-500", "bg-orange-500",
];

const TEXT_COLORS = [
  "text-primary-600", "text-amber-500", "text-green-500",
  "text-pink-500", "text-blue-500", "text-orange-500",
];

// ── Reusable components ──

const StatCard = ({ icon: Icon, label, value, sub, growth, color }) => {
  const isPositive = parseFloat(growth) >= 0;
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={18} />
        </div>
        {growth !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${isPositive ? "text-green-600" : "text-red-500"}`}>
            {isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {Math.abs(growth)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-0.5">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
};

const BarChart = ({ data, valueKey, labelKey, colorClass = "bg-primary-600", formatValue }) => {
  if (!data?.length) return (
    <div className="h-40 flex items-center justify-center text-gray-300 text-sm">
      No data available
    </div>
  );
  const max = Math.max(...data.map((d) => d[valueKey] || 0));
  return (
    <div className="flex items-end gap-2 h-40">
      {data.map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
          <div
            className="relative w-full"
            style={{ height: "100px" }}
          >
            <div
              className={`absolute bottom-0 w-full ${colorClass} rounded-t-lg transition-all group-hover:opacity-80`}
              style={{ height: `${max > 0 ? Math.max((item[valueKey] / max) * 100, 3) : 3}%` }}
            />
          </div>
          {formatValue && (
            <span className="text-[10px] text-gray-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity absolute -mt-6">
              {formatValue(item[valueKey])}
            </span>
          )}
          <p className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
            {item[labelKey]}
          </p>
        </div>
      ))}
    </div>
  );
};

const HorizontalBar = ({ label, value, max, color, suffix = "" }) => (
  <div className="flex items-center gap-3">
    <p className="text-xs text-gray-600 w-24 shrink-0 truncate">{label}</p>
    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} rounded-full transition-all`}
        style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }}
      />
    </div>
    <p className="text-xs font-semibold text-gray-900 w-16 text-right shrink-0">
      {suffix}{typeof value === "number" && value > 1000 ? formatPrice(value) : value}
    </p>
  </div>
);

const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-5">
    <h2 className="text-base font-bold text-gray-900">{title}</h2>
    {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
  </div>
);

// ── Main component ──

const AdminAnalytics = () => {
  const [activeSection, setActiveSection] = useState("revenue");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn:  () => adminAPI.getAnalytics().then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });

  const revenue  = data?.revenue  || {};
  const orders   = data?.orders   || {};
  const products = data?.products || {};
  const customers= data?.customers|| {};

  // Build monthly chart data
  const buildMonthlyData = (monthlyArr, valueKey) => {
    const map = {};
    monthlyArr?.forEach((item) => { map[item._id.month] = item[valueKey]; });
    return MONTH_NAMES.map((m, i) => ({
      month: m,
      value: map[i + 1] || 0,
    }));
  };

  const revenueChartData  = buildMonthlyData(revenue.monthly, "revenue");
  const ordersChartData   = buildMonthlyData(orders.monthly,  "orders");
  const customerChartData = buildMonthlyData(customers.monthly, "count");

  const orderStatusData = [
    { status: "Processing", count: orders.byStatus?.find((s) => s._id === "processing")?.count || 0, color: "bg-primary-600" },
    { status: "In transit", count: orders.byStatus?.find((s) => s._id === "transit")?.count    || 0, color: "bg-amber-500"   },
    { status: "Delivered",  count: orders.byStatus?.find((s) => s._id === "delivered")?.count  || 0, color: "bg-green-500"   },
    { status: "Cancelled",  count: orders.byStatus?.find((s) => s._id === "cancelled")?.count  || 0, color: "bg-red-400"     },
    { status: "Packed",     count: orders.byStatus?.find((s) => s._id === "packed")?.count     || 0, color: "bg-blue-500"    },
  ];
  const maxStatusCount = Math.max(...orderStatusData.map((s) => s.count));

  const SECTIONS = [
    { id: "revenue",   label: "Revenue",   icon: TrendingUp  },
    { id: "orders",    label: "Orders",    icon: ShoppingBag },
    { id: "products",  label: "Products",  icon: Package     },
    { id: "customers", label: "Customers", icon: Users       },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Full overview of your store performance
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-600 border border-gray-200 bg-white px-4 py-2 rounded-xl hover:border-gray-300 transition-colors"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Top KPI summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Total revenue"
          value={formatPrice(revenue.total || 0)}
          sub={`${formatPrice(revenue.thisMonth || 0)} this month`}
          growth={revenue.growth}
          color="bg-primary-50 text-primary-600"
        />
        <StatCard
          icon={ShoppingBag}
          label="Total orders"
          value={(orders.total || 0).toLocaleString()}
          sub={`${orders.thisMonth || 0} this month`}
          growth={orders.growth}
          color="bg-green-50 text-green-600"
        />
        <StatCard
          icon={Users}
          label="Total customers"
          value={(customers.total || 0).toLocaleString()}
          sub={`${customers.thisMonth || 0} new this month`}
          growth={customers.growth}
          color="bg-amber-50 text-amber-600"
        />
        <StatCard
          icon={BarChart2}
          label="Avg order value"
          value={formatPrice(revenue.avgOrder || 0)}
          sub={`${orders.cancelRate || 0}% cancellation rate`}
          color="bg-blue-50 text-blue-600"
        />
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeSection === id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Revenue section ── */}
      {activeSection === "revenue" && (
        <div className="space-y-5">
          {/* Revenue stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total revenue",    value: formatPrice(revenue.total || 0)      },
              { label: "This month",       value: formatPrice(revenue.thisMonth || 0)  },
              { label: "Last month",       value: formatPrice(revenue.lastMonth || 0)  },
              { label: "Avg order value",  value: formatPrice(revenue.avgOrder || 0)   },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            {/* Monthly revenue chart */}
            <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5">
              <SectionHeader
                title="Monthly revenue"
                subtitle={`${new Date().getFullYear()} — all months`}
              />
              <BarChart
                data={revenueChartData}
                valueKey="value"
                labelKey="month"
                colorClass="bg-primary-600"
                formatValue={(v) => `$${(v / 1000).toFixed(1)}k`}
              />
            </div>

            {/* Revenue by category */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <SectionHeader
                title="Revenue by category"
                subtitle="All time breakdown"
              />
              {revenue.byCategory?.length > 0 ? (
                <div className="space-y-3">
                  {revenue.byCategory.map((cat, i) => (
                    <HorizontalBar
                      key={cat._id || i}
                      label={cat._id || "Uncategorized"}
                      value={cat.revenue}
                      max={revenue.byCategory[0]?.revenue || 1}
                      color={COLORS[i % COLORS.length]}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-300 text-center py-8">No data yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Orders section ── */}
      {activeSection === "orders" && (
        <div className="space-y-5">
          {/* Orders stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total orders",       value: (orders.total     || 0).toLocaleString() },
              { label: "This month",         value: (orders.thisMonth || 0).toLocaleString() },
              { label: "Last month",         value: (orders.lastMonth || 0).toLocaleString() },
              { label: "Cancellation rate",  value: `${orders.cancelRate || 0}%`              },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            {/* Monthly orders chart */}
            <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5">
              <SectionHeader
                title="Orders over time"
                subtitle={`${new Date().getFullYear()} — monthly`}
              />
              <BarChart
                data={ordersChartData}
                valueKey="value"
                labelKey="month"
                colorClass="bg-green-500"
              />
            </div>

            {/* Orders by status */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <SectionHeader
                title="Orders by status"
                subtitle="Current distribution"
              />
              <div className="space-y-3">
                {orderStatusData.filter((s) => s.count > 0).map((s) => (
                  <HorizontalBar
                    key={s.status}
                    label={s.status}
                    value={s.count}
                    max={maxStatusCount}
                    color={s.color}
                  />
                ))}
                {orderStatusData.every((s) => s.count === 0) && (
                  <p className="text-sm text-gray-300 text-center py-8">No orders yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Products section ── */}
      {activeSection === "products" && (
        <div className="space-y-5">
          {/* Products stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total products",    value: products.total || 0                                      },
              { label: "Total sold",        value: products.topSelling?.reduce((s, p) => s + (p.sold || 0), 0).toLocaleString() || 0 },
              { label: "Low stock",         value: products.lowStock?.length || 0                           },
              { label: "Categories",        value: products.byCategory?.length || 0                         },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            {/* Top selling products */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <SectionHeader
                title="Top selling products"
                subtitle="By units sold"
              />
              {products.topSelling?.length > 0 ? (
                <div className="space-y-3">
                  {products.topSelling.map((product, i) => (
                    <div key={product._id} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-300 w-4 shrink-0">
                        {i + 1}
                      </span>
                      <div className="w-9 h-9 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                        {product.images?.[0]?.url ? (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={14} className="text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 line-clamp-1">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star size={9} className="fill-amber-400 text-amber-400" />
                          <span className="text-xs text-gray-400">{product.rating?.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-gray-900">{product.sold || 0} sold</p>
                        <p className="text-xs text-gray-400">{formatPrice(product.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-300 text-center py-8">No sales data yet</p>
              )}
            </div>

            {/* Products by category */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <SectionHeader
                title="Products by category"
                subtitle="Distribution across categories"
              />
              {products.byCategory?.length > 0 ? (
                <div className="space-y-3">
                  {products.byCategory.map((cat, i) => (
                    <div key={cat._id || i} className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${COLORS[i % COLORS.length]} shrink-0`} />
                      <p className="text-xs text-gray-600 flex-1 truncate">
                        {cat._id || "Uncategorized"}
                      </p>
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${COLORS[i % COLORS.length]} rounded-full`}
                          style={{
                            width: `${(cat.count / Math.max(...products.byCategory.map((c) => c.count))) * 100}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs font-semibold text-gray-900 w-8 text-right shrink-0">
                        {cat.count}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-300 text-center py-8">No products yet</p>
              )}
            </div>
          </div>

          {/* Low stock alerts */}
          {products.lowStock?.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-5">
                <AlertCircle size={16} className="text-amber-500" />
                <h2 className="text-base font-bold text-gray-900">
                  Low stock alerts
                </h2>
                <span className="text-xs font-medium bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">
                  {products.lowStock.length} products
                </span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {products.lowStock.map((product) => (
                  <div
                    key={product._id}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${
                      product.stock === 0
                        ? "border-red-100 bg-red-50"
                        : "border-amber-100 bg-amber-50"
                    }`}
                  >
                    <div className="w-10 h-10 bg-white rounded-lg overflow-hidden shrink-0 border border-gray-100">
                      {product.images?.[0]?.url ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={14} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 line-clamp-1">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {product.category?.name || "Uncategorized"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        product.stock === 0
                          ? "bg-red-100 text-red-600"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {product.stock === 0 ? "Out" : `${product.stock} left`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Customers section ── */}
      {activeSection === "customers" && (
        <div className="space-y-5">
          {/* Customer stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total customers",    value: (customers.total     || 0).toLocaleString() },
              { label: "New this month",     value: (customers.thisMonth || 0).toLocaleString() },
              { label: "Last month",         value: (customers.lastMonth || 0).toLocaleString() },
              { label: "Growth rate",        value: `${customers.growth  || 0}%`                },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            {/* Customer growth chart */}
            <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5">
              <SectionHeader
                title="Customer growth"
                subtitle={`${new Date().getFullYear()} — new customers per month`}
              />
              <BarChart
                data={customerChartData}
                valueKey="value"
                labelKey="month"
                colorClass="bg-amber-500"
              />
            </div>

            {/* Top customers */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <SectionHeader
                title="Top customers"
                subtitle="By total spend"
              />
              {customers.top?.length > 0 ? (
                <div className="space-y-3">
                  {customers.top.map((customer, i) => (
                    <div key={customer._id} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        ["bg-primary-100 text-primary-600","bg-amber-100 text-amber-700","bg-green-100 text-green-700","bg-pink-100 text-pink-700","bg-blue-100 text-blue-700"][i % 5]
                      }`}>
                        {customer.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">
                          {customer.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {customer.orders} order{customer.orders !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <p className="text-xs font-bold text-gray-900 shrink-0">
                        {formatPrice(customer.totalSpent)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-300 text-center py-8">No customer data yet</p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminAnalytics;