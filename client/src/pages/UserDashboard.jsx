import { useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard, Package, Heart, MapPin, CreditCard,
  User, Settings, LogOut, Star, ChevronRight, Download,
  Truck, CheckCircle, Clock, XCircle, Edit2, Camera,
  ShoppingBag, Award, TrendingUp,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/utils/formatPrice";
import { ordersAPI } from "@/store/api/ordersApi";
import { authAPI } from "@/store/api/authApi";
import toast from "react-hot-toast";

const MOCK_WISHLIST = [
  { _id: "w1", name: "Bose QuietComfort Ultra Earbuds", price: 179, originalPrice: null, rating: 4.6, category: "Electronics", inStock: true  },
  { _id: "w2", name: "MacBook Air M3 15-inch",          price: 1099,originalPrice: null, rating: 4.9, category: "Electronics", inStock: true  },
  { _id: "w3", name: "Linen Wide-Leg Trousers",         price: 72,  originalPrice: 90,   rating: 4.3, category: "Fashion",     inStock: true  },
  { _id: "w4", name: "Scented Soy Candle Set",          price: 28,  originalPrice: null, rating: 4.6, category: "Home",        inStock: false },
];

const STATUS_CONFIG = {
  processing: { label: "Processing", color: "bg-primary-50 text-primary-600", icon: Clock       },
  packed:     { label: "Packed",     color: "bg-blue-50 text-blue-600",       icon: Package     },
  shipped:    { label: "Shipped",    color: "bg-indigo-50 text-indigo-600",   icon: Truck       },
  transit:    { label: "In transit", color: "bg-amber-50 text-amber-600",     icon: Truck       },
  delivered:  { label: "Delivered",  color: "bg-green-50 text-green-600",     icon: CheckCircle },
  cancelled:  { label: "Cancelled",  color: "bg-red-50 text-red-500",         icon: XCircle     },
};

const NAV_ITEMS = [
  { id: "overview",  label: "Overview",        icon: LayoutDashboard },
  { id: "orders",    label: "My orders",       icon: Package         },
  { id: "wishlist",  label: "Wishlist",        icon: Heart           },
  { id: "addresses", label: "Addresses",       icon: MapPin          },
  { id: "payment",   label: "Payment methods", icon: CreditCard      },
  { id: "profile",   label: "Profile",         icon: User            },
  { id: "settings",  label: "Settings",        icon: Settings        },
];

const UserDashboard = () => {
  const { user, signOut } = useAuth();
  const { addItem }       = useCart();

  const [activeTab,   setActiveTab]   = useState("overview");
  const [orderFilter, setOrderFilter] = useState("all");
  const [wishlist,    setWishlist]    = useState(MOCK_WISHLIST);

  // Fetch real orders from backend
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn:  () => ordersAPI.getMyOrders().then((r) => r.data),
  });

  const orders         = ordersData?.orders || [];
  const totalSpent     = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + o.totalPrice, 0);
  const deliveredCount = orders.filter((o) => o.status === "delivered").length;

  const filteredOrders = orderFilter === "all"
    ? orders
    : orders.filter((o) => o.status === orderFilter);

  const removeWishlist = (id) => {
    setWishlist((p) => p.filter((w) => w._id !== id));
    toast.success("Removed from wishlist");
  };

  // ── Sidebar ──
  const Sidebar = () => (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="bg-primary-900 p-6 text-center relative">
          <div className="relative inline-block mb-3">
            <div className="w-16 h-16 rounded-full bg-primary-400 flex items-center justify-center text-xl font-bold text-white mx-auto">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <button className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors">
              <Camera size={11} className="text-gray-600" />
            </button>
          </div>
          <p className="text-white font-semibold text-sm">{user?.name || "User"}</p>
          <p className="text-primary-200 text-xs mt-0.5 truncate">{user?.email}</p>
          <div className="inline-flex items-center gap-1.5 bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-medium px-3 py-1 rounded-full mt-2">
            <Award size={11} />
            Gold member
          </div>
        </div>

        <div className="p-2">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                activeTab === id
                  ? "bg-primary-50 text-primary-600 font-semibold"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon size={15} />
              {label}
              {id === "wishlist" && wishlist.length > 0 && (
                <span className="ml-auto text-[10px] font-bold bg-red-100 text-red-500 w-5 h-5 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
              {id === "orders" && orders.length > 0 && (
                <span className="ml-auto text-[10px] font-bold bg-primary-100 text-primary-600 w-5 h-5 rounded-full flex items-center justify-center">
                  {orders.length}
                </span>
              )}
            </button>
          ))}
          <div className="border-t border-gray-100 mt-2 pt-2">
            <button
              onClick={() => { signOut(); toast.success("Signed out"); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </aside>
  );

  // ── Overview tab ──
  const Overview = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon:  Package,
            label: "Total orders",
            value: ordersLoading ? "..." : orders.length,
            sub:   "Lifetime",
          },
          {
            icon:  TrendingUp,
            label: "Total spent",
            value: ordersLoading ? "..." : formatPrice(totalSpent),
            sub:   "Since joining",
          },
          {
            icon:  CheckCircle,
            label: "Delivered",
            value: ordersLoading ? "..." : deliveredCount,
            sub:   "Successfully",
          },
          {
            icon:  Award,
            label: "Reward points",
            value: "2,460",
            sub:   "≈ $24.60 value",
          },
        ].map(({ icon: Icon, label, value, sub }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-2xl p-4">
            <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center mb-3">
              <Icon size={16} className="text-primary-600" />
            </div>
            <p className="text-xl font-bold text-gray-900">{value}</p>
            <p className="text-xs font-medium text-gray-600 mt-0.5">{label}</p>
            <p className="text-xs text-gray-400">{sub}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Recent orders</h3>
          <button
            onClick={() => setActiveTab("orders")}
            className="text-xs text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1 transition-colors"
          >
            View all <ChevronRight size={13} />
          </button>
        </div>

        {ordersLoading ? (
          <div className="py-8 text-center text-sm text-gray-400">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="py-8 text-center">
            <ShoppingBag size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No orders yet</p>
            <Link to="/products" className="btn-primary text-xs mt-3 inline-block">
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 3).map((order) => {
              const cfg  = STATUS_CONFIG[order.status] || STATUS_CONFIG.processing;
              const Icon = cfg.icon;
              return (
                <div key={order._id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                      <ShoppingBag size={16} className="text-gray-300" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">#{order.orderNumber}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} items
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>
                      <Icon size={10} />
                      {cfg.label}
                    </span>
                    <p className="text-sm font-bold text-gray-900">{formatPrice(order.totalPrice)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Wishlist preview */}
      {wishlist.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Saved items</h3>
            <button
              onClick={() => setActiveTab("wishlist")}
              className="text-xs text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1 transition-colors"
            >
              View all <ChevronRight size={13} />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {wishlist.slice(0, 4).map((item) => (
              <div key={item._id} className="border border-gray-100 rounded-xl p-3 text-center hover:border-primary-200 transition-colors">
                <div className="w-full aspect-square bg-gray-50 rounded-lg flex items-center justify-center mb-2">
                  <Heart size={20} className="text-gray-200" />
                </div>
                <p className="text-xs font-medium text-gray-800 line-clamp-2 mb-1">{item.name}</p>
                <p className="text-sm font-bold text-primary-600">{formatPrice(item.price)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ── Orders tab ──
  const Orders = () => (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <div className="flex border-b border-gray-100 overflow-x-auto">
        {[
          { id: "all",        label: "All orders"  },
          { id: "processing", label: "Processing"  },
          { id: "transit",    label: "In transit"  },
          { id: "delivered",  label: "Delivered"   },
          { id: "cancelled",  label: "Cancelled"   },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setOrderFilter(tab.id)}
            className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              orderFilter === tab.id
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs text-gray-400">
              ({tab.id === "all"
                ? orders.length
                : orders.filter((o) => o.status === tab.id).length})
            </span>
          </button>
        ))}
      </div>

      {ordersLoading ? (
        <div className="py-16 text-center text-sm text-gray-400">Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-16 text-center">
          <Package size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium text-sm">No orders found</p>
          {orderFilter !== "all" && (
            <button
              onClick={() => setOrderFilter("all")}
              className="text-xs text-primary-600 font-medium mt-2 hover:underline"
            >
              Show all orders
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {filteredOrders.map((order) => {
            const cfg  = STATUS_CONFIG[order.status] || STATUS_CONFIG.processing;
            const Icon = cfg.icon;
            return (
              <div key={order._id} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-gray-900">#{order.orderNumber}</p>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>
                        <Icon size={10} />
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric", month: "long", day: "numeric",
                      })} · {order.items.length} items
                    </p>
                  </div>
                  <p className="text-base font-bold text-gray-900">
                    {formatPrice(order.totalPrice)}
                  </p>
                </div>

                {/* Items */}
                <div className="space-y-1.5 mb-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs text-gray-500">
                      <span>{item.name} × {item.quantity}</span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                  {order.status === "transit" && (
                    <button className="flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors">
                      <Truck size={12} />
                      Track shipment
                    </button>
                  )}
                  {order.status === "delivered" && (
                    <>
                      <button className="flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors">
                        <Star size={12} />
                        Write review
                      </button>
                      <button className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors">
                        <ShoppingBag size={12} />
                        Reorder
                      </button>
                    </>
                  )}
                  {["processing", "packed"].includes(order.status) && (
                    <button
                      onClick={async () => {
                        try {
                          await ordersAPI.cancel(order._id);
                          toast.success("Order cancelled");
                        } catch {
                          toast.error("Cannot cancel this order");
                        }
                      }}
                      className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
                    >
                      <XCircle size={12} />
                      Cancel order
                    </button>
                  )}
                  <button className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors ml-auto">
                    <Download size={12} />
                    Invoice
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ── Wishlist tab ──
  const Wishlist = () => (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Saved items ({wishlist.length})</h3>
      </div>
      {wishlist.length === 0 ? (
        <div className="py-16 text-center">
          <Heart size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium text-sm">Your wishlist is empty</p>
          <Link to="/products" className="btn-primary text-sm mt-4 inline-block">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {wishlist.map((item) => (
            <div key={item._id} className="border border-gray-100 rounded-xl p-4 flex gap-3 hover:border-primary-200 transition-colors">
              <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                <Heart size={20} className="text-gray-200" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-primary-600 font-medium mb-0.5">{item.category}</p>
                <p className="text-sm font-semibold text-gray-900 line-clamp-1 mb-1">{item.name}</p>
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={10}
                      className={s <= Math.round(item.rating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-gray-900">{formatPrice(item.price)}</span>
                    {item.originalPrice && (
                      <span className="text-xs text-gray-400 line-through ml-1.5">
                        {formatPrice(item.originalPrice)}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        addItem({
                          _id:           item._id,
                          name:          item.name,
                          price:         item.price,
                          category:      item.category,
                          selectedColor: null,
                          selectedSize:  null,
                          quantity:      1,
                        });
                        toast.success("Added to cart");
                      }}
                      disabled={!item.inStock}
                      className="text-xs bg-primary-600 hover:bg-primary-800 disabled:bg-gray-200 disabled:cursor-not-allowed text-white px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      Add to cart
                    </button>
                    <button
                      onClick={() => removeWishlist(item._id)}
                      className="text-xs border border-gray-200 hover:border-red-200 hover:text-red-500 text-gray-400 px-2 py-1.5 rounded-lg transition-colors"
                    >
                      <XCircle size={12} />
                    </button>
                  </div>
                </div>
                {!item.inStock && (
                  <p className="text-xs text-red-500 mt-1">Out of stock</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ── Profile tab ──
  const Profile = () => {
    const [editing, setEditing] = useState(false);
    const [saving,  setSaving]  = useState(false);
    const [profile, setProfile] = useState({
      name:  user?.name  || "",
      email: user?.email || "",
      phone: user?.phone || "",
      dob:   "1992-06-15",
    });

    const handleSave = async () => {
      setSaving(true);
      try {
        await authAPI.updateProfile({
          name:  profile.name,
          email: profile.email,
          phone: profile.phone,
        });
        setEditing(false);
        toast.success("Profile updated successfully");
      } catch {
        toast.error("Failed to update profile");
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900">Personal information</h3>
          <button
            onClick={() => setEditing((p) => !p)}
            className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors"
          >
            <Edit2 size={13} />
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: "Full name",     field: "name",  type: "text"  },
            { label: "Email address", field: "email", type: "email" },
            { label: "Phone number",  field: "phone", type: "tel"   },
            { label: "Date of birth", field: "dob",   type: "date"  },
          ].map(({ label, field, type }) => (
            <div key={field}>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">
                {label}
              </label>
              {editing ? (
                <input
                  type={type}
                  value={profile[field]}
                  onChange={(e) => setProfile((p) => ({ ...p, [field]: e.target.value }))}
                  className="input-field"
                />
              ) : (
                <p className="text-sm font-medium text-gray-900 py-2.5 px-3 bg-gray-50 rounded-lg">
                  {profile[field] || "—"}
                </p>
              )}
            </div>
          ))}
        </div>

        {editing && (
          <div className="flex gap-3 mt-5 pt-5 border-t border-gray-100">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary text-sm flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </button>
            <button onClick={() => setEditing(false)} className="btn-ghost text-sm">
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  };

  const TABS = {
    overview: <Overview />,
    orders:   <Orders />,
    wishlist: <Wishlist />,
    profile:  <Profile />,
    addresses: (
      <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center">
        <MapPin size={36} className="text-gray-200 mx-auto mb-3" />
        <p className="text-gray-500 font-medium text-sm">Address management coming soon</p>
      </div>
    ),
    payment: (
      <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center">
        <CreditCard size={36} className="text-gray-200 mx-auto mb-3" />
        <p className="text-gray-500 font-medium text-sm">Payment methods coming soon</p>
      </div>
    ),
    settings: (
      <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center">
        <Settings size={36} className="text-gray-200 mx-auto mb-3" />
        <p className="text-gray-500 font-medium text-sm">Settings coming soon</p>
      </div>
    ),
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <h1 className="text-xl font-bold text-gray-900">My account</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Welcome back, {user?.name?.split(" ")[0] || "there"}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <Sidebar />
          <main className="flex-1 min-w-0">
            {TABS[activeTab]}
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;