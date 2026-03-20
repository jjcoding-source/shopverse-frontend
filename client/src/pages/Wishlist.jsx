import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Star,
  ChevronRight,
  Share2,
  SlidersHorizontal,
  X,
  Package,
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatPrice, calcDiscount } from "@/utils/formatPrice";
import toast from "react-hot-toast";

const INITIAL_WISHLIST = [
  {
    _id: "w1",
    name: "Bose QuietComfort Ultra Earbuds",
    price: 179,
    originalPrice: null,
    category: "Electronics",
    brand: "Bose",
    rating: 4.6,
    reviewCount: 1420,
    stock: 8,
    inStock: true,
    images: [],
    addedOn: "March 15, 2025",
  },
  {
    _id: "w2",
    name: "MacBook Air M3 15-inch Laptop",
    price: 1099,
    originalPrice: null,
    category: "Electronics",
    brand: "Apple",
    rating: 4.9,
    reviewCount: 987,
    stock: 5,
    inStock: true,
    images: [],
    addedOn: "March 10, 2025",
  },
  {
    _id: "w3",
    name: "Linen Wide-Leg Trousers — Spring Collection",
    price: 72,
    originalPrice: 90,
    category: "Fashion",
    brand: "Zara",
    rating: 4.3,
    reviewCount: 411,
    stock: 18,
    inStock: true,
    images: [],
    addedOn: "March 5, 2025",
  },
  {
    _id: "w4",
    name: "Scented Soy Candle Set — Lavender & Cedar",
    price: 28,
    originalPrice: null,
    category: "Home & Living",
    brand: "Diptyque",
    rating: 4.6,
    reviewCount: 304,
    stock: 0,
    inStock: false,
    images: [],
    addedOn: "February 28, 2025",
  },
  {
    _id: "w5",
    name: "Sony Alpha A7C II Mirrorless Camera",
    price: 2199,
    originalPrice: 2499,
    category: "Electronics",
    brand: "Sony",
    rating: 4.8,
    reviewCount: 562,
    stock: 3,
    inStock: true,
    images: [],
    addedOn: "February 20, 2025",
  },
  {
    _id: "w6",
    name: "Urban Runner Sneakers — Lightweight",
    price: 64,
    originalPrice: 80,
    category: "Fashion",
    brand: "Nike",
    rating: 4.7,
    reviewCount: 876,
    stock: 20,
    inStock: true,
    images: [],
    addedOn: "February 12, 2025",
  },
];

const StarRow = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        size={11}
        className={
          s <= Math.round(rating)
            ? "fill-amber-400 text-amber-400"
            : "fill-gray-200 text-gray-200"
        }
      />
    ))}
  </div>
);

const Wishlist = () => {
  const { addItem } = useCart();

  const [items,    setItems]    = useState(INITIAL_WISHLIST);
  const [sortBy,   setSortBy]   = useState("newest");
  const [filterBy, setFilterBy] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  const categories = ["all", ...new Set(INITIAL_WISHLIST.map((i) => i.category))];

  const handleRemove = (id) => {
    setItems((p) => p.filter((i) => i._id !== id));
    toast.success("Removed from wishlist");
  };

  const handleAddToCart = (item) => {
    if (!item.inStock) return;
    addItem({
      _id:          item._id,
      name:         item.name,
      price:        item.price,
      image:        item.images?.[0],
      category:     item.category,
      selectedColor: null,
      selectedSize:  null,
      quantity:      1,
    });
    toast.success(`${item.name} added to cart`);
  };

  const handleAddAllToCart = () => {
    const inStockItems = items.filter((i) => i.inStock);
    inStockItems.forEach((item) => {
      addItem({
        _id:           item._id,
        name:          item.name,
        price:         item.price,
        image:         item.images?.[0],
        category:      item.category,
        selectedColor: null,
        selectedSize:  null,
        quantity:      1,
      });
    });
    toast.success(`${inStockItems.length} items added to cart`);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success("Wishlist link copied to clipboard");
  };

  const handleClearAll = () => {
    setItems([]);
    toast.success("Wishlist cleared");
  };

  const filtered = items.filter(
    (i) => filterBy === "all" || i.category === filterBy
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "newest")     return 0;
    if (sortBy === "price-asc")  return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "rating")     return b.rating - a.rating;
    return 0;
  });

  const inStockCount = items.filter((i) => i.inStock).length;

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
            <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link to="/dashboard" className="hover:text-primary-600 transition-colors">Account</Link>
            <ChevronRight size={12} />
            <span className="text-gray-700 font-medium">Wishlist</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Heart size={22} className="text-red-500 fill-red-500" />
                My wishlist
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {items.length} saved item{items.length !== 1 ? "s" : ""} ·{" "}
                {inStockCount} in stock
              </p>
            </div>

            {items.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 px-4 py-2 rounded-xl transition-colors"
                >
                  <Share2 size={14} />
                  Share
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-500 border border-gray-200 hover:border-red-200 px-4 py-2 rounded-xl transition-colors"
                >
                  <Trash2 size={14} />
                  Clear all
                </button>
                <button
                  onClick={handleAddAllToCart}
                  disabled={inStockCount === 0}
                  className="flex items-center gap-1.5 text-sm font-semibold bg-primary-600 hover:bg-primary-800 disabled:bg-gray-200 disabled:cursor-not-allowed text-white px-5 py-2 rounded-xl transition-colors"
                >
                  <ShoppingCart size={14} />
                  Add all to cart ({inStockCount})
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {items.length === 0 ? (
          /* Empty state */
          <div className="bg-white border border-gray-100 rounded-2xl py-24 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <Heart size={32} className="text-red-200" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-500 text-sm mb-8 max-w-xs mx-auto">
              Save items you love by clicking the heart icon on any product. They'll appear here.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 btn-primary"
            >
              <ShoppingCart size={16} />
              Browse products
            </Link>
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              {/* Category filter pills */}
              <div className="flex items-center gap-2 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterBy(cat)}
                    className={`text-xs font-medium px-3.5 py-1.5 rounded-full border transition-all capitalize ${
                      filterBy === cat
                        ? "bg-primary-600 text-white border-primary-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-primary-300"
                    }`}
                  >
                    {cat === "all" ? `All (${items.length})` : cat}
                  </button>
                ))}
              </div>

              {/* Sort + view mode */}
              <div className="flex items-center gap-2 ml-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none focus:border-primary-400 cursor-pointer transition-colors"
                >
                  <option value="newest">Newest first</option>
                  <option value="price-asc">Price: Low to high</option>
                  <option value="price-desc">Price: High to low</option>
                  <option value="rating">Best rated</option>
                </select>

                <div className="hidden sm:flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === "grid"
                        ? "bg-primary-600 text-white"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <SlidersHorizontal size={14} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === "list"
                        ? "bg-primary-600 text-white"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <Package size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* No results after filter */}
            {sorted.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl py-16 text-center">
                <X size={32} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium text-sm">
                  No items in this category
                </p>
                <button
                  onClick={() => setFilterBy("all")}
                  className="text-xs text-primary-600 font-medium mt-2 hover:underline"
                >
                  Show all items
                </button>
              </div>
            ) : viewMode === "grid" ? (
              /* Grid view */
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {sorted.map((item) => {
                  const discount = item.originalPrice
                    ? calcDiscount(item.originalPrice, item.price)
                    : null;

                  return (
                    <div
                      key={item._id}
                      className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-primary-200 hover:shadow-md transition-all group"
                    >
                      {/* Image */}
                      <div className="relative aspect-square bg-gray-50 flex items-center justify-center">
                        {item.images?.[0] ? (
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <Heart size={36} className="text-gray-100" />
                        )}

                        {/* Badges */}
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                          {discount && (
                            <span className="badge bg-red-500 text-white text-[10px] px-2 py-0.5">
                              -{discount}%
                            </span>
                          )}
                          {!item.inStock && (
                            <span className="badge bg-gray-500 text-white text-[10px] px-2 py-0.5">
                              Out of stock
                            </span>
                          )}
                        </div>

                        {/* Remove button */}
                        <button
                          onClick={() => handleRemove(item._id)}
                          className="absolute top-2.5 right-2.5 w-7 h-7 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X size={12} className="text-gray-400 hover:text-red-500" />
                        </button>
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <p className="text-xs text-primary-600 font-medium uppercase tracking-wider mb-1">
                          {item.category}
                        </p>
                        <Link
                          to={`/products/${item._id}`}
                          className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug hover:text-primary-600 transition-colors block mb-2"
                        >
                          {item.name}
                        </Link>

                        <div className="flex items-center gap-1.5 mb-3">
                          <StarRow rating={item.rating} />
                          <span className="text-xs text-gray-400">
                            ({item.reviewCount?.toLocaleString()})
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-base font-bold text-gray-900">
                              {formatPrice(item.price)}
                            </span>
                            {item.originalPrice && (
                              <span className="text-xs text-gray-400 line-through ml-1.5">
                                {formatPrice(item.originalPrice)}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleAddToCart(item)}
                          disabled={!item.inStock}
                          className="w-full mt-3 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-800 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
                        >
                          <ShoppingCart size={14} />
                          {item.inStock ? "Add to cart" : "Out of stock"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* List view */
              <div className="space-y-3">
                {sorted.map((item) => {
                  const discount = item.originalPrice
                    ? calcDiscount(item.originalPrice, item.price)
                    : null;

                  return (
                    <div
                      key={item._id}
                      className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4 hover:border-primary-200 hover:shadow-sm transition-all"
                    >
                      {/* Image */}
                      <div className="w-24 h-24 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 border border-gray-100">
                        {item.images?.[0] ? (
                          <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <Heart size={24} className="text-gray-200" />
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs text-primary-600 font-medium uppercase tracking-wider mb-0.5">
                              {item.brand} · {item.category}
                            </p>
                            <Link
                              to={`/products/${item._id}`}
                              className="text-sm font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-1 block"
                            >
                              {item.name}
                            </Link>
                          </div>
                          <button
                            onClick={() => handleRemove(item._id)}
                            className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors shrink-0"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 mt-1.5 mb-2">
                          <StarRow rating={item.rating} />
                          <span className="text-xs text-gray-400">
                            {item.rating} ({item.reviewCount?.toLocaleString()})
                          </span>
                          {!item.inStock && (
                            <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                              Out of stock
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-baseline gap-2">
                            <span className="text-base font-bold text-gray-900">
                              {formatPrice(item.price)}
                            </span>
                            {item.originalPrice && (
                              <span className="text-xs text-gray-400 line-through">
                                {formatPrice(item.originalPrice)}
                              </span>
                            )}
                            {discount && (
                              <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                                -{discount}%
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">
                              Added {item.addedOn}
                            </span>
                            <button
                              onClick={() => handleAddToCart(item)}
                              disabled={!item.inStock}
                              className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-800 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                            >
                              <ShoppingCart size={13} />
                              {item.inStock ? "Add to cart" : "Unavailable"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Continue shopping */}
            <div className="mt-8 text-center">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors"
              >
                <ChevronRight size={15} className="rotate-180" />
                Continue shopping
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Wishlist;