import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  ArrowRight,
} from "lucide-react";

const footerLinks = {
  Shop: [
    { label: "All products", to: "/products" },
    { label: "Electronics", to: "/products?category=electronics" },
    { label: "Fashion", to: "/products?category=fashion" },
    { label: "Home & Living", to: "/products?category=home" },
    { label: "Deals", to: "/products?tag=deals" },
  ],
  Account: [
    { label: "Sign in", to: "/login" },
    { label: "Register", to: "/register" },
    { label: "Dashboard", to: "/dashboard" },
    { label: "Order history", to: "/orders" },
    { label: "Wishlist", to: "/dashboard?tab=wishlist" },
  ],
  Support: [
    { label: "Help center", to: "#" },
    { label: "Track order", to: "#" },
    { label: "Returns", to: "#" },
    { label: "Shipping info", to: "#" },
    { label: "Contact us", to: "#" },
  ],
};

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Newsletter */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-white text-lg font-semibold mb-1">
                Stay in the loop
              </h3>
              <p className="text-sm text-gray-400">
                Get exclusive deals, new arrivals and insider-only discounts.
              </p>
            </div>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex gap-2 w-full md:w-auto"
            >
              <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 flex-1 md:w-72 focus-within:border-primary-400 transition-colors">
                <Mail size={15} className="text-gray-500 shrink-0" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-transparent flex-1 text-sm text-gray-200 placeholder:text-gray-500 outline-none"
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 bg-primary-600 hover:bg-primary-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shrink-0"
              >
                Subscribe
                <ArrowRight size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <span className="text-xl font-bold text-white tracking-tight">
                Shop<span className="text-primary-400">Verse</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-5 max-w-xs">
              Your one-stop destination for premium products across electronics,
              fashion, home and more — delivered fast and hassle-free.
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-sm text-gray-400">
                <MapPin size={14} className="text-gray-500 shrink-0" />
                123 Commerce St, New York, NY 10001
              </div>
              <div className="flex items-center gap-2.5 text-sm text-gray-400">
                <Phone size={14} className="text-gray-500 shrink-0" />
                +1 (800) 555-0172
              </div>
              <div className="flex items-center gap-2.5 text-sm text-gray-400">
                <Mail size={14} className="text-gray-500 shrink-0" />
                support@shopverse.com
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-white text-sm font-semibold mb-4">
                {heading}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-gray-400 hover:text-primary-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © 2025 ShopVerse. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-500 hover:text-primary-400 transition-colors">
              <Facebook size={16} />
            </a>
            <a href="#" className="text-gray-500 hover:text-primary-400 transition-colors">
              <Twitter size={16} />
            </a>
            <a href="#" className="text-gray-500 hover:text-primary-400 transition-colors">
              <Instagram size={16} />
            </a>
            <a href="#" className="text-gray-500 hover:text-primary-400 transition-colors">
              <Youtube size={16} />
            </a>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <a href="#" className="hover:text-gray-300 transition-colors">Privacy policy</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Terms of service</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Cookie policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;