import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  RefreshCw,
  Shield,
  ChevronRight,
  Minus,
  Plus,
  Check,
  Package,
  MessageSquare,
  ThumbsUp,
  Image,
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatPrice, calcDiscount } from "@/utils/formatPrice";
import ProductCard from "@/components/product/ProductCard";
import toast from "react-hot-toast";

const MOCK_PRODUCT = {
  _id: "1",
  name: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
  description:
    "Industry-leading noise cancellation with the new Integrated Processor V1. Up to 30-hour battery life with quick charging. Crystal clear hands-free calling with 4 beamforming microphones. Multipoint connection lets you pair with 2 devices simultaneously. Wear detection auto-pauses music when you remove headphones.",
  price: 279,
  originalPrice: 349,
  category: "electronics",
  brand: "Sony",
  rating: 4.9,
  reviewCount: 3241,
  stock: 10,
  isNew: false,
  isFeatured: true,
  images: [null, null, null, null],
  colors: ["Midnight Black", "Platinum Silver", "Midnight Blue"],
  specs: [
    { label: "Driver unit",       value: "30mm" },
    { label: "Frequency response", value: "4Hz–40kHz" },
    { label: "Battery life",      value: "30 hours" },
    { label: "Charging time",     value: "3.5 hours" },
    { label: "Connectivity",      value: "Bluetooth 5.2" },
    { label: "Weight",            value: "250g" },
    { label: "Noise cancellation", value: "Industry leading ANC" },
    { label: "Microphones",       value: "4 beamforming mics" },
  ],
};

const MOCK_REVIEWS = [
  {
    _id: "r1",
    user:   { name: "James Kumar",    avatar: "JK", avatarBg: "bg-primary-100 text-primary-700" },
    rating: 5,
    title:  "Best headphones I've ever owned",
    body:   "The noise cancellation is absolutely incredible. I use these for work calls and long-haul flights — they block out everything. Battery life is phenomenal, easily lasts the whole day. Sound quality is top notch with deep bass and crisp highs. Well worth every penny.",
    date:   "March 12, 2025",
    helpful: 48,
    verified: true,
  },
  {
    _id: "r2",
    user:   { name: "Sarah Williams", avatar: "SW", avatarBg: "bg-pink-100 text-pink-700" },
    rating: 5,
    title:  "Incredible ANC and comfort",
    body:   "I've tried many premium headphones over the years and the XM5 sits at the very top for long-wear comfort. The ear cups are soft and don't cause fatigue even after 4+ hours. Highly recommend for anyone who travels frequently or works in noisy environments.",
    date:   "February 28, 2025",
    helpful: 31,
    verified: true,
  },
  {
    _id: "r3",
    user:   { name: "Alex Chen",      avatar: "AC", avatarBg: "bg-teal-100 text-teal-700" },
    rating: 4,
    title:  "Great headphones, minor gripes",
    body:   "Really solid headphones overall. The ANC and sound quality are exceptional. My only gripe is that the touch controls take a bit of getting used to. Once you learn the gestures though, it becomes second nature. Build quality feels premium and the case is excellent.",
    date:   "February 14, 2025",
    helpful: 19,
    verified: true,
  },
];

const RELATED_PRODUCTS = [
  { _id: "6",  name: "Bose QuietComfort Ultra Earbuds",      price: 179,  originalPrice: null, category: "electronics", rating: 4.6, reviewCount: 1420, stock: 8,  isNew: false, isFeatured: false, images: [] },
  { _id: "5",  name: "Smart Watch Series X Fitness Tracker", price: 149,  originalPrice: 229,  category: "electronics", rating: 4.9, reviewCount: 4312, stock: 15, isNew: false, isFeatured: true,  images: [] },
  { _id: "2",  name: "Apple Watch Series 10 — 42mm",         price: 399,  originalPrice: null, category: "electronics", rating: 4.8, reviewCount: 5102, stock: 6,  isNew: true,  isFeatured: false, images: [] },
  { _id: "9",  name: "MacBook Air M3 15-inch Laptop",        price: 1099, originalPrice: null, category: "electronics", rating: 4.9, reviewCount: 987,  stock: 5,  isNew: true,  isFeatured: true,  images: [] },
];

const RATING_DIST = [
  { star: 5, pct: 88 },
  { star: 4, pct: 8  },
  { star: 3, pct: 3  },
  { star: 2, pct: 1  },
  { star: 1, pct: 0  },
];

const StarRow = ({ count, filled }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        size={count}
        className={
          s <= filled
            ? "fill-amber-400 text-amber-400"
            : "fill-gray-200 text-gray-200"
        }
      />
    ))}
  </div>
);

const ProductDetail = () => {
  const { id } = useParams();
  const { addItem } = useCart();

  const product = MOCK_PRODUCT;

  const [activeImg,     setActiveImg]     = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [qty,           setQty]           = useState(1);
  const [wishlisted,    setWishlisted]    = useState(false);
  const [activeTab,     setActiveTab]     = useState("description");
  const [adding,        setAdding]        = useState(false);

  const discount = product.originalPrice
    ? calcDiscount(product.originalPrice, product.price)
    : null;

  const handleAddToCart = () => {
    setAdding(true);
    addItem({
      _id:           product._id,
      name:          product.name,
      price:         product.price,
      image:         product.images?.[0],
      selectedColor,
      selectedSize:  null,
      quantity:      qty,
    });
    toast.success(`${product.name} added to cart`);
    setTimeout(() => setAdding(false), 800);
  };

  const handleWishlist = () => {
    setWishlisted((p) => !p);
    toast.success(wishlisted ? "Removed from wishlist" : "Saved to wishlist");
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link to="/products" className="hover:text-primary-600 transition-colors">Products</Link>
            <ChevronRight size={12} />
            <Link
              to={`/products?category=${product.category}`}
              className="hover:text-primary-600 transition-colors capitalize"
            >
              {product.category}
            </Link>
            <ChevronRight size={12} />
            <span className="text-gray-700 font-medium line-clamp-1 max-w-xs">
              {product.name}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Top section ── */}
        <div className="grid lg:grid-cols-2 gap-10 mb-12">

          {/* Left — image gallery */}
          <div className="flex flex-col gap-3">
            {/* Main image */}
            <div className="relative aspect-square bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center overflow-hidden group">
              {product.images[activeImg] ? (
                <img
                  src={product.images[activeImg]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-gray-200">
                  <Image size={64} />
                  <span className="text-sm text-gray-300">Product image</span>
                </div>
              )}
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {discount && (
                  <span className="badge bg-red-500 text-white text-xs px-2.5 py-1">
                    -{discount}%
                  </span>
                )}
                {product.isFeatured && (
                  <span className="badge bg-primary-600 text-white text-xs px-2.5 py-1">
                    Featured
                  </span>
                )}
              </div>
              {/* Wishlist overlay */}
              <button
                onClick={handleWishlist}
                className="absolute top-4 right-4 w-9 h-9 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center hover:bg-primary-50 transition-colors"
              >
                <Heart
                  size={16}
                  className={
                    wishlisted
                      ? "fill-red-500 text-red-500"
                      : "text-gray-400"
                  }
                />
              </button>
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-2.5">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`aspect-square rounded-xl border-2 bg-gray-50 flex items-center justify-center transition-all ${
                    activeImg === i
                      ? "border-primary-600 bg-primary-50"
                      : "border-gray-100 hover:border-gray-300"
                  }`}
                >
                  {img ? (
                    <img src={img} alt="" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <Image size={20} className={activeImg === i ? "text-primary-400" : "text-gray-300"} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right — product info */}
          <div className="flex flex-col gap-5">
            {/* Brand + name */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-primary-600 uppercase tracking-widest">
                  {product.brand}
                </span>
                {product.stock > 0 ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    <Check size={11} />
                    In stock
                  </span>
                ) : (
                  <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                    Out of stock
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-3">
                {product.name}
              </h1>

              {/* Rating row */}
              <div className="flex items-center gap-3">
                <StarRow count={15} filled={Math.round(product.rating)} />
                <span className="text-sm font-semibold text-gray-800">
                  {product.rating}
                </span>
                <span className="text-sm text-gray-400">
                  ({product.reviewCount.toLocaleString()} reviews)
                </span>
                <span className="text-gray-200">|</span>
                <span className="text-sm text-gray-500">
                  {product.brand}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 pb-5 border-b border-gray-100">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {discount && (
                <span className="badge bg-red-50 text-red-600 text-sm px-2.5 py-1">
                  Save {formatPrice(product.originalPrice - product.price)}
                </span>
              )}
            </div>

            {/* Color selector */}
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-3">
                Color —{" "}
                <span className="font-normal text-gray-500">{selectedColor}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                      selectedColor === color
                        ? "border-primary-600 bg-primary-50 text-primary-700 font-medium"
                        : "border-gray-200 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-3">Quantity</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-12 h-10 flex items-center justify-center text-sm font-semibold text-gray-900 border-x border-gray-200">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                    className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <span className="text-xs text-gray-400">
                  {product.stock} units available
                </span>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || adding}
                className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-800 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                <ShoppingCart size={17} />
                {adding ? "Adding..." : "Add to cart"}
              </button>
              <Link
                to="/checkout"
                className="flex-1 flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Buy now
              </Link>
              <button
                onClick={handleWishlist}
                className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-200 transition-colors"
              >
                <Heart
                  size={18}
                  className={
                    wishlisted ? "fill-red-500 text-red-500" : "text-gray-400"
                  }
                />
              </button>
              <button className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <Share2 size={18} className="text-gray-400" />
              </button>
            </div>

            {/* Delivery info */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              {[
                {
                  icon: Truck,
                  title: "Free delivery",
                  desc: "Estimated by Wed, March 25",
                },
                {
                  icon: RefreshCw,
                  title: "Free 30-day returns",
                  desc: "Easy hassle-free returns",
                },
                {
                  icon: Shield,
                  title: "2-year warranty",
                  desc: "Official Sony warranty included",
                },
                {
                  icon: Package,
                  title: "Secure packaging",
                  desc: "Tamper-proof sealed packaging",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg border border-gray-200 flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{title}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="border-b border-gray-200 mb-8">
          <div className="flex gap-0">
            {[
              { id: "description", label: "Description", icon: MessageSquare },
              { id: "specs",       label: "Specifications", icon: Package },
              { id: "reviews",     label: `Reviews (${product.reviewCount.toLocaleString()})`, icon: Star },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === id
                    ? "border-primary-600 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Description tab */}
        {activeTab === "description" && (
          <div className="max-w-3xl mb-12">
            <p className="text-gray-600 leading-relaxed text-sm mb-6">
              {product.description}
            </p>
            <ul className="space-y-2.5">
              {[
                "Industry-leading noise cancellation powered by integrated Processor V1",
                "Up to 30-hour battery life with quick charge (3 min = 3 hours)",
                "Crystal clear hands-free calling with 4 beamforming microphones",
                "Multipoint connection — pair with 2 devices simultaneously",
                "Wear detection auto-pauses music when headphones are removed",
                "Precise Voice Pickup Technology with AI noise reduction",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <Check size={15} className="text-green-500 mt-0.5 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Specs tab */}
        {activeTab === "specs" && (
          <div className="max-w-2xl mb-12">
            <div className="border border-gray-100 rounded-2xl overflow-hidden">
              {product.specs.map((spec, i) => (
                <div
                  key={spec.label}
                  className={`flex items-center px-5 py-3.5 text-sm ${
                    i % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <span className="w-48 font-medium text-gray-600 shrink-0">
                    {spec.label}
                  </span>
                  <span className="text-gray-900">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews tab */}
        {activeTab === "reviews" && (
          <div className="mb-12">
            <div className="grid lg:grid-cols-3 gap-8 mb-8">
              {/* Rating summary */}
              <div className="card p-6 text-center">
                <div className="text-5xl font-bold text-gray-900 mb-1">
                  {product.rating}
                </div>
                <StarRow count={18} filled={Math.round(product.rating)} />
                <p className="text-sm text-gray-400 mt-2">
                  {product.reviewCount.toLocaleString()} reviews
                </p>
                <div className="mt-5 space-y-2">
                  {RATING_DIST.map(({ star, pct }) => (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-6 text-right">
                        {star}
                      </span>
                      <Star size={11} className="fill-amber-400 text-amber-400 shrink-0" />
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-8">{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review cards */}
              <div className="lg:col-span-2 space-y-4">
                {MOCK_REVIEWS.map((review) => (
                  <div key={review._id} className="card p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${review.user.avatarBg}`}
                        >
                          {review.user.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {review.user.name}
                          </p>
                          <p className="text-xs text-gray-400">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StarRow count={13} filled={review.rating} />
                        {review.verified && (
                          <span className="text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1.5">
                      {review.title}
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">
                      {review.body}
                    </p>
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary-600 transition-colors">
                        <ThumbsUp size={12} />
                        Helpful ({review.helpful})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Related products ── */}
        <div className="border-t border-gray-100 pt-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Related products</h2>
            <Link
              to="/products"
              className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors"
            >
              View all
              <ChevronRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {RELATED_PRODUCTS.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;