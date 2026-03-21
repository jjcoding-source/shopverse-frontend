import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight, ShoppingBag, Shield,
  Truck, RefreshCw, Headphones,
  Star, ChevronRight,
} from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import Loader      from "@/components/common/Loader";
import { CATEGORIES } from "@/utils/constants";
import { productsAPI } from "@/store/api/productsApi";

const FEATURES = [
  { icon: Truck,       title: "Free shipping",   desc: "On all orders over $75"         },
  { icon: RefreshCw,   title: "Easy returns",    desc: "30-day hassle-free returns"      },
  { icon: Shield,      title: "Secure checkout", desc: "SSL encrypted & PCI compliant"  },
  { icon: Headphones,  title: "24/7 support",    desc: "Dedicated customer care"         },
];

const CATEGORY_COLORS = {
  electronics: "bg-primary-50 text-primary-700 border-primary-100",
  fashion:     "bg-pink-50 text-pink-700 border-pink-100",
  home:        "bg-teal-50 text-teal-700 border-teal-100",
  beauty:      "bg-amber-50 text-amber-700 border-amber-100",
  sports:      "bg-green-50 text-green-700 border-green-100",
  books:       "bg-orange-50 text-orange-700 border-orange-100",
};

const TESTIMONIALS = [
  {
    name:     "Sarah Williams",
    role:     "Verified buyer",
    review:   "Incredible experience. The quality of products is top-notch and delivery was faster than expected. Will definitely shop again.",
    rating:   5,
    avatar:   "SW",
    avatarBg: "bg-pink-100 text-pink-700",
  },
  {
    name:     "James Kumar",
    role:     "Verified buyer",
    review:   "ShopVerse has become my go-to store. Wide variety, genuine products and the customer support team is super responsive.",
    rating:   5,
    avatar:   "JK",
    avatarBg: "bg-primary-100 text-primary-700",
  },
  {
    name:     "Alex Chen",
    role:     "Verified buyer",
    review:   "Smooth checkout, easy returns and the packaging is excellent. The deals section always has something worth grabbing.",
    rating:   4,
    avatar:   "AC",
    avatarBg: "bg-teal-100 text-teal-700",
  },
];

const Home = () => {
  const { data: featuredData, isLoading: featuredLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn:  () => productsAPI.getFeatured().then((r) => r.data),
  });

  const { data: newData, isLoading: newLoading } = useQuery({
    queryKey: ["new-products"],
    queryFn:  () => productsAPI.getAll({ limit: 4, sort: "-createdAt" }).then((r) => r.data),
  });

  const featuredProducts = featuredData?.products || [];
  const newProducts      = newData?.products      || [];

  return (
    <div className="bg-white">

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-200 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 text-primary-100 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <Star size={13} className="fill-amber-400 text-amber-400" />
                New arrivals for Spring 2025
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-5">
                Discover products
                <br />
                <span className="text-primary-200">you'll love</span>
              </h1>
              <p className="text-primary-100 text-lg leading-relaxed mb-8 max-w-md">
                Explore thousands of curated products across electronics, fashion, home and beauty — all delivered fast to your door.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors"
                >
                  <ShoppingBag size={18} />
                  Shop now
                </Link>
                <Link
                  to="/products?tag=deals"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium px-6 py-3 rounded-xl transition-colors"
                >
                  View deals
                  <ArrowRight size={16} />
                </Link>
              </div>
              <div className="flex items-center gap-8 mt-10">
                {[
                  { value: "50K+", label: "Products"  },
                  { value: "2M+",  label: "Customers" },
                  { value: "4.9★", label: "Rating"    },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-primary-200">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-80 h-80">
                <div className="absolute inset-0 bg-white/10 rounded-3xl border border-white/20" />
                <div className="absolute inset-4 bg-white/10 rounded-2xl border border-white/10 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                      <ShoppingBag size={36} className="text-white" />
                    </div>
                    <p className="text-white font-semibold text-lg">ShopVerse</p>
                    <p className="text-primary-200 text-sm mt-1">Premium shopping</p>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-white rounded-xl px-3 py-2 shadow-lg">
                  <p className="text-xs text-gray-500">Today's orders</p>
                  <p className="text-sm font-bold text-gray-900">+1,248</p>
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl px-3 py-2 shadow-lg">
                  <p className="text-xs text-gray-500">Avg rating</p>
                  <p className="text-sm font-bold text-amber-500">4.9 / 5.0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features bar */}
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{title}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Shop by category</h2>
            <p className="text-sm text-gray-500 mt-1">Browse our wide selection</p>
          </div>
          <Link
            to="/products"
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors"
          >
            View all <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.id}`}
              className={`flex flex-col items-center gap-3 p-5 rounded-2xl border hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${
                CATEGORY_COLORS[cat.id] || "bg-gray-50 text-gray-700 border-gray-100"
              }`}
            >
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-2xl">{cat.icon}</span>
              </div>
              <p className="text-sm font-semibold">{cat.label}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending products */}
      <section className="bg-gray-50 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Trending now</h2>
              <p className="text-sm text-gray-500 mt-1">Most loved by our customers</p>
            </div>
            <Link
              to="/products"
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors"
            >
              See all <ChevronRight size={16} />
            </Link>
          </div>
          {featuredLoading ? (
            <Loader text="Loading products..." />
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              No featured products yet
            </div>
          )}
        </div>
      </section>

      {/* Promo banners */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid md:grid-cols-2 gap-5">
          <div className="relative bg-primary-900 rounded-2xl overflow-hidden p-8 flex flex-col justify-between min-h-[200px]">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary-200 rounded-full blur-2xl" />
            </div>
            <div className="relative">
              <span className="inline-block bg-white/10 text-primary-100 text-xs font-medium px-3 py-1 rounded-full mb-3 border border-white/20">
                Limited offer
              </span>
              <h3 className="text-2xl font-bold text-white mb-2">Up to 50% off electronics</h3>
              <p className="text-primary-200 text-sm mb-5">Premium headphones, smartwatches and more.</p>
              <Link
                to="/products?category=electronics"
                className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-primary-50 transition-colors"
              >
                Shop electronics <ArrowRight size={14} />
              </Link>
            </div>
          </div>
          <div className="relative bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl overflow-hidden p-8 flex flex-col justify-between min-h-[200px]">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-2xl" />
            </div>
            <div className="relative">
              <span className="inline-block bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full mb-3 border border-white/30">
                New season
              </span>
              <h3 className="text-2xl font-bold text-white mb-2">Fresh fashion arrivals</h3>
              <p className="text-orange-100 text-sm mb-5">Spring collection is here. Explore the latest styles.</p>
              <Link
                to="/products?category=fashion"
                className="inline-flex items-center gap-2 bg-white text-orange-600 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-orange-50 transition-colors"
              >
                Explore fashion <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* New arrivals */}
      <section className="bg-gray-50 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">New arrivals</h2>
              <p className="text-sm text-gray-500 mt-1">Just landed in our store</p>
            </div>
            <Link
              to="/products?sort=-createdAt"
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors"
            >
              View all new <ChevronRight size={16} />
            </Link>
          </div>
          {newLoading ? (
            <Loader text="Loading products..." />
          ) : newProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {newProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              No new products yet
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">What our customers say</h2>
          <p className="text-gray-500 text-sm">Trusted by over 2 million happy shoppers worldwide</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="card p-6 flex flex-col gap-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={14}
                    className={s <= t.rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed flex-1">"{t.review}"</p>
              <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold ${t.avatarBg}`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-primary-900 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Ready to start shopping?</h2>
          <p className="text-primary-200 text-base mb-8">
            Join over 2 million customers who trust ShopVerse for their everyday needs.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-7 py-3 rounded-xl hover:bg-primary-50 transition-colors"
            >
              Create free account <ArrowRight size={16} />
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white font-medium px-7 py-3 rounded-xl hover:bg-white/20 transition-colors"
            >
              Browse products
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;