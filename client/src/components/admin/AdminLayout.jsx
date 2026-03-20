import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingBag, Users,
  Tag, BarChart2, Settings, LogOut, Menu, X,
  Bell, ChevronDown, Shield,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

const NAV_ITEMS = [
  { label: "Dashboard",  to: "/admin",          icon: LayoutDashboard },
  { label: "Orders",     to: "/admin/orders",   icon: ShoppingBag     },
  { label: "Products",   to: "/admin/products", icon: Package         },
  { label: "Customers",  to: "/admin/users",    icon: Users           },
  { label: "Categories", to: "/admin/categories",icon: Tag            },
  { label: "Analytics",  to: "/admin/analytics",icon: BarChart2       },
  { label: "Settings",   to: "/admin/settings", icon: Settings        },
];

const AdminLayout = ({ children }) => {
  const location             = useLocation();
  const navigate             = useNavigate();
  const { user, signOut }    = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut();
    toast.success("Signed out");
    navigate("/");
  };

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? "" : "w-60"}`}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <Link to="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-400 rounded-lg flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <span className="text-white font-bold text-base tracking-tight">
            ShopVerse <span className="text-primary-300 text-sm font-medium">Admin</span>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-primary-400 uppercase tracking-widest px-3 py-2">
          Main menu
        </p>
        {NAV_ITEMS.slice(0, 4).map(({ label, to, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? "bg-primary-600 text-white"
                  : "text-primary-100 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}

        <p className="text-[10px] font-semibold text-primary-400 uppercase tracking-widest px-3 py-2 mt-4">
          Management
        </p>
        {NAV_ITEMS.slice(4).map(({ label, to, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? "bg-primary-600 text-white"
                  : "text-primary-100 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom user */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="w-8 h-8 rounded-full bg-primary-400 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {user?.name?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user?.name || "Admin"}</p>
            <p className="text-primary-300 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-primary-200 hover:bg-white/10 hover:text-white transition-colors mt-1"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-primary-900 shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-primary-900 flex flex-col z-10">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
            >
              <X size={20} />
            </button>
            <Sidebar mobile />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                {NAV_ITEMS.find((n) => n.to === location.pathname)?.label || "Admin"}
              </h2>
              <p className="text-xs text-gray-400">
                {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((p) => !p)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700">
                  {user?.name?.charAt(0).toUpperCase() || "A"}
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50">
                  <Link
                    to="/"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Back to store
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;