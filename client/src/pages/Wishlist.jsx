import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Heart, ShoppingCart, Trash2, Star,
  ChevronRight, Share2, SlidersHorizontal,
  X, Package,
} from "lucide-react";
import { useCart }      from "@/hooks/useCart";
import { useWishlist }  from "@/hooks/useWishlist";
import { useAuth }      from "@/hooks/useAuth";
import { authAPI }      from "@/store/api/authApi";
import { formatPrice, calcDiscount } from "@/utils/formatPrice";
import Loader           from "@/components/common/Loader";
import toast            from "react-hot-toast";

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
  const { addItem }         = useCart();
  const { toggle }          = useWishlist();
  const { isAuthenticated } = useAuth();
  const navigate            = useNavigate();
  const queryClient         = useQueryClient();

  const [sortBy,   setSortBy]   = useState("newest");
  const [filterBy, setFilterBy] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  // Fetch full wishlist products from backend
  const { data, isLoading, isError } = useQuery({
    queryKey: ["wishlist"],
    queryFn:  () => authAPI.getMe().then((r) => r.data.user.wishlist || []),
    enabled:  isAuthenticated,
  });

  const items = Array.isArray(data) ? data : [];

  const wishlistProducts = items.filter(Boolean);

  const categories = [
    "all",
    ...new Set(
      wishlistProducts
        .map((p) => p?.category?.name || p?.category || "")
        .filter(Boolean)
    ),
  ];

  const filtered = wishlistProducts.filter((p) => {
    if (!p) return false;
    if (filterBy === "all") return true;
    const catName = p?.category?.name || p?.category || "";
    return catName === filterBy;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "price-asc")  return (a.price || 0) - (b.price || 0);
    if (sortBy === "price-desc") return (b.price || 0) - (a.price || 0);
    if (sortBy === "rating")     return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  const handleRemove = (productId) => {
    toggle(productId);
  };

  const handleAddToCart = (product) => {
    if (!product.stock || product.stock === 0) {
      toast.error("This product is out of stock");
      return;
    }
    addItem({
      _id:           product._id,
      name:          product.name,
      price:         product.price,
      image:         product.images?.[0]?.url,
      category:      product.category?.name || product.category,
      selectedColor: null,
      selectedSize:  null,
      quantity:      1,
    });
    toast.success(`${product.name} added to cart`);
  };

  const handleAddAllToCart = () => {
    const inStock = sorted.filter((p) => p.stock > 0);
    if (inStock.length === 0) {
      toast.error("No in-stock items to add");
      return;
    }
    inStock.forEach((p) => handleAddToCart(p));
    toast.success(`${inStock.length} items added to cart`);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success("Wishlist link copied");
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Heart size={48} className="text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sign in to view wishlist</h2>
          <p className="text-gray-500 text-sm mb-6">
            Save your favourite products and access them anywhere.
          </p>
          <Link to="/login" className="btn-primary">Sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* Header */}
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
                {isLoading
                  ? "Loading..."
                  : `${wishlistProducts.length} saved item${wishlistProducts.length !== 1 ? "s" : ""}`}
              </p>
            </div>

            {wishlistProducts.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 px-4 py-2 rounded-xl transition-colors"
                >
                  <Share2 size={14} />
                  Share
                </button>
                <button
                  onClick={handleAddAllToCart}
                  className="flex items-center gap-1.5 text-sm font-semibold bg-primary-600 hover:bg-primary-800 text-white px-5 py-2 rounded-xl transition-colors"
                >
                  <ShoppingCart size={14} />
                  Add all to cart
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {isLoading ? (
          <Loader text="Loading wishlist..." />
        ) : isError ? (
          <div className="bg-white border border-gray-100 rounded-2xl py-16 text-center">
            <p className="text-red-500 font-medium text-sm">Failed to load wishlist</p>
            <button
              onClick={() => queryClient.invalidateQueries(["wishlist"])}
              className="text-xs text-primary-600 mt-2 hover:underline"
            >
              Try again
            </button>
          </div>
        ) : wishlistProducts.length === 0 ? (
          /* Empty state */
          <div className="bg-white border border-gray-100 rounded-2xl py-24 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <Heart size={32} className="text-red-200" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 text-sm mb-8 max-w-xs mx-auto">
              Save items you love by clicking the heart icon on any product.
            </p>
            <Link to="/products" className="btn-primary inline-flex items-center gap-2">
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
                    {cat === "all" ? `All (${wishlistProducts.length})` : cat}
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
                <p className="text-gray-500 font-medium text-sm">No items in this category</p>
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
                {sorted.map((product) => {
                  if (!product?._id) return null;
                  const discount = product.originalPrice
                    ? calcDiscount(product.originalPrice, product.price)
                    : null;
                  const categoryName = product.category?.name || product.category || "";

                  return (
                    <div
                      key={product._id}
                      className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-primary-200 hover:shadow-md transition-all group"
                    >
                      {/* Image */}
                      <div className="relative aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                        {product.images?.[0]?.url ? (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                            onClick={() => navigate(`/products/${product._id}`)}
                          />
                        ) : (
                          <Heart
                            size={36}
                            className="text-gray-100 cursor-pointer"
                            onClick={() => navigate(`/products/${product._id}`)}
                          />
                        )}

                        {/* Badges */}
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                          {discount && (
                            <span className="badge bg-red-500 text-white text-[10px] px-2 py-0.5">
                              -{discount}%
                            </span>
                          )}
                          {!product.stock && (
                            <span className="badge bg-gray-500 text-white text-[10px] px-2 py-0.5">
                              Out of stock
                            </span>
                          )}
                        </div>

                        {/* Remove button */}
                        <button
                          onClick={() => handleRemove(product._id)}
                          className="absolute top-2.5 right-2.5 w-7 h-7 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X size={12} className="text-red-400" />
                        </button>
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        {categoryName && (
                          <p className="text-xs text-primary-600 font-medium uppercase tracking-wider mb-1">
                            {categoryName}
                          </p>
                        )}
                        <Link
                          to={`/products/${product._id}`}
                          className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug hover:text-primary-600 transition-colors block mb-2"
                        >
                          {product.name}
                        </Link>

                        {product.rating > 0 && (
                          <div className="flex items-center gap-1.5 mb-3">
                            <StarRow rating={product.rating} />
                            <span className="text-xs text-gray-400">
                              ({product.reviewCount?.toLocaleString() || 0})
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-base font-bold text-gray-900">
                              {formatPrice(product.price)}
                            </span>
                            {product.originalPrice && (
                              <span className="text-xs text-gray-400 line-through ml-1.5">
                                {formatPrice(product.originalPrice)}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={!product.stock}
                          className="w-full mt-3 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-800 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
                        >
                          <ShoppingCart size={14} />
                          {product.stock ? "Add to cart" : "Out of stock"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* List view */
              <div className="space-y-3">
                {sorted.map((product) => {
                  if (!product?._id) return null;
                  const discount = product.originalPrice
                    ? calcDiscount(product.originalPrice, product.price)
                    : null;
                  const categoryName = product.category?.name || product.category || "";

                  return (
                    <div
                      key={product._id}
                      className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4 hover:border-primary-200 hover:shadow-sm transition-all"
                    >
                      {/* Image */}
                      <div
                        className="w-24 h-24 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 border border-gray-100 cursor-pointer overflow-hidden"
                        onClick={() => navigate(`/products/${product._id}`)}
                      >
                        {product.images?.[0]?.url ? (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <Heart size={24} className="text-gray-200" />
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            {categoryName && (
                              <p className="text-xs text-primary-600 font-medium uppercase tracking-wider mb-0.5">
                                {categoryName}
                              </p>
                            )}
                            <Link
                              to={`/products/${product._id}`}
                              className="text-sm font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-1 block"
                            >
                              {product.name}
                            </Link>
                          </div>
                          <button
                            onClick={() => handleRemove(product._id)}
                            className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors shrink-0"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {product.rating > 0 && (
                          <div className="flex items-center gap-2 mt-1.5 mb-2">
                            <StarRow rating={product.rating} />
                            <span className="text-xs text-gray-400">
                              {product.rating} ({product.reviewCount?.toLocaleString() || 0})
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-baseline gap-2">
                            <span className="text-base font-bold text-gray-900">
                              {formatPrice(product.price)}
                            </span>
                            {product.originalPrice && (
                              <span className="text-xs text-gray-400 line-through">
                                {formatPrice(product.originalPrice)}
                              </span>
                            )}
                            {discount && (
                              <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                                -{discount}%
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={!product.stock}
                            className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-800 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                          >
                            <ShoppingCart size={13} />
                            {product.stock ? "Add to cart" : "Unavailable"}
                          </button>
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