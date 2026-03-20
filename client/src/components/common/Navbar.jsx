import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Heart,
  Menu,
  X,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Package,
  Shield,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { CATEGORIES } from "@/utils/constants";

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, signOut } = useAuth();
  const { count } = useCart();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [searchOpen,     setSearchOpen]     = useState(false);
  const [searchQuery,    setSearchQuery]    = useState("");
  const [mobileOpen,     setMobileOpen]     = useState(false);
  const [userMenuOpen,   setUserMenuOpen]   = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const isOnProductsPage = location.pathname === "/products";

  useEffect(() => {
    if (isOnProductsPage) {
      const params = new URLSearchParams(location.search);
      setSearchQuery(params.get("search") || "");
    } else {
      setSearchQuery("");
    }
  }, [location.search, isOnProductsPage]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (isOnProductsPage) {
      const params = new URLSearchParams(location.search);
      if (val.trim()) {
        params.set("search", val.trim());
      } else {
        params.delete("search");
      }
      navigate(`/products?${params.toString()}`, { replace: true });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    } else {
      navigate("/products");
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    if (isOnProductsPage) {
      const params = new URLSearchParams(location.search);
      params.delete("search");
      const remaining = params.toString();
      navigate(`/products${remaining ? `?${remaining}` : ""}`, { replace: true });
    }
  };

  const handleSignOut = () => {
    signOut();
    setUserMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      {/* Announcement bar */}
      <div className="bg-primary-900 text-primary-100 text-xs text-center py-2 font-medium tracking-wide">
        Free shipping on orders over $75 · Use code{" "}
        <span className="text-white font-semibold">SUMMER50</span> for 50% off
      </div>

      {/* Main navbar */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-6">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-1 shrink-0">
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              Shop<span className="text-primary-600">Verse</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm text-gray-600 hover:text-primary-600 font-medium transition-colors"
            >
              Home
            </Link>

            {/* Categories dropdown */}
            <div className="relative">
              <button
                onClick={() => setCategoriesOpen((p) => !p)}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600 font-medium transition-colors"
              >
                Categories
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    categoriesOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {categoriesOpen && (
                <div className="absolute top-full left-0 mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50">
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/products?category=${cat.id}`}
                      onClick={() => setCategoriesOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/products"
              className="text-sm text-gray-600 hover:text-primary-600 font-medium transition-colors"
            >
              All products
            </Link>
            <Link
              to="/products?tag=deals"
              className="text-sm text-gray-600 hover:text-primary-600 font-medium transition-colors"
            >
              Deals
            </Link>
          </div>

          {/* Desktop search bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-sm items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 focus-within:border-primary-400 focus-within:bg-white transition-all"
          >
            <Search size={15} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder={
                isOnProductsPage ? "Filter products..." : "Search products..."
              }
              value={searchQuery}
              onChange={handleSearchChange}
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none"
            />
            {searchQuery && (
              <button type="button" onClick={handleClearSearch}>
                <X size={13} className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {/* Mobile search toggle */}
            <button
              onClick={() => setSearchOpen((p) => !p)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-primary-600 transition-colors"
            >
              <Search size={18} />
            </button>

            {/* Wishlist */}
            <Link
              to={isAuthenticated ? "/wishlist" : "/login"}
              className="hidden sm:flex p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-primary-600 transition-colors"
            >
              <Heart size={18} />
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-primary-600 transition-colors"
            >
              <ShoppingCart size={18} />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary-600 text-white text-[10px] font-semibold rounded-full flex items-center justify-center px-1">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </Link>

            {/* User menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((p) => !p)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-semibold">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-gray-400 hidden sm:block transition-transform duration-200 ${
                      userMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                    >
                      <LayoutDashboard size={15} />
                      Dashboard
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                    >
                      <Package size={15} />
                      My orders
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                      >
                        <Shield size={15} />
                        Admin panel
                      </Link>
                    )}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={15} />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((p) => !p)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors ml-1"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        {searchOpen && (
          <form onSubmit={handleSearchSubmit} className="md:hidden pb-3">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 focus-within:border-primary-400 transition-all">
              <Search size={15} className="text-gray-400 shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder={
                  isOnProductsPage ? "Filter products..." : "Search products..."
                }
                value={searchQuery}
                onChange={handleSearchChange}
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none"
              />
              {searchQuery && (
                <button type="button" onClick={handleClearSearch}>
                  <X size={13} className="text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </form>
        )}
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1">
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="block py-2.5 px-3 rounded-lg text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors"
          >
            Home
          </Link>
          <Link
            to="/products"
            onClick={() => setMobileOpen(false)}
            className="block py-2.5 px-3 rounded-lg text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors"
          >
            All products
          </Link>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.id}`}
              onClick={() => setMobileOpen(false)}
              className="block py-2.5 px-3 rounded-lg text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"
            >
              {cat.label}
            </Link>
          ))}
          <Link
            to="/products?tag=deals"
            onClick={() => setMobileOpen(false)}
            className="block py-2.5 px-3 rounded-lg text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-colors"
          >
            Deals
          </Link>
          {!isAuthenticated && (
            <div className="flex gap-3 pt-3 border-t border-gray-100">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="btn-outline flex-1 text-center text-sm"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="btn-primary flex-1 text-center text-sm"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;