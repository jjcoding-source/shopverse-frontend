import { useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import {
  Star, ShoppingCart, Heart, Share2,
  Truck, RefreshCw, Shield, ChevronRight,
  Minus, Plus, Check, Package,
  MessageSquare, Image,
} from "lucide-react";
import { useCart }      from "@/hooks/useCart";
import { useWishlist }  from "@/hooks/useWishlist";
import { useAuth }      from "@/hooks/useAuth";
import { formatPrice, calcDiscount } from "@/utils/formatPrice";
import ProductCard      from "@/components/product/ProductCard";
import Loader           from "@/components/common/Loader";
import ReviewsSection   from "@/components/product/ReviewsSection";
import { productsAPI }  from "@/store/api/productsApi";
import { useQuery }     from "@tanstack/react-query";
import toast            from "react-hot-toast";

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
  const { id }                    = useParams();
  const { addItem }               = useCart();
  const { isAuthenticated }       = useAuth();
  const { isWishlisted, toggle }  = useWishlist();

  const [activeImg,     setActiveImg]     = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [qty,           setQty]           = useState(1);
  const [adding,        setAdding]        = useState(false);
  const [searchParams]                    = useSearchParams();
  const [activeTab,     setActiveTab]     = useState(
    searchParams.get("tab") || "description"
  );

  const { data: productData, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn:  () => productsAPI.getOne(id).then((r) => r.data),
  });

  const { data: relatedData } = useQuery({
    queryKey: ["related", id],
    queryFn:  () => productsAPI.getRelated(id).then((r) => r.data),
    enabled:  !!id,
  });

  const product  = productData?.product;
  const related  = relatedData?.products || [];
  const discount = product?.originalPrice
    ? calcDiscount(product.originalPrice, product.price)
    : null;

  // hook — synced with MongoDB
  const wishlisted = isWishlisted(product?._id);

  const handleWishlist = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to save items");
      return;
    }
    toggle(product._id);
  };

  const handleAddToCart = () => {
    if (!product) return;
    setAdding(true);
    addItem({
      _id:           product._id,
      name:          product.name,
      price:         product.price,
      image:         product.images?.[0]?.url,
      category:      product.category?.name,
      selectedColor: selectedColor || product.colors?.[0] || null,
      selectedSize:  null,
      quantity:      qty,
    });
    toast.success(`${product.name} added to cart`);
    setTimeout(() => setAdding(false), 800);
  };

  if (isLoading) return <Loader fullscreen text="Loading product..." />;

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Package size={48} className="text-gray-200 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Product not found</h2>
        <Link to="/products" className="btn-primary inline-block mt-4">
          Browse products
        </Link>
      </div>
    );
  }

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
            <span className="text-gray-700 font-medium line-clamp-1 max-w-xs">
              {product.name}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Top section */}
        <div className="grid lg:grid-cols-2 gap-10 mb-12">

          {/* Image gallery */}
          <div className="flex flex-col gap-3">
            <div className="relative aspect-square bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center overflow-hidden">
              {product.images?.length > 0 ? (
                <img
                  src={product.images[activeImg]?.url}
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

              {/* Wishlist button on image */}
              <button
                onClick={handleWishlist}
                className="absolute top-4 right-4 w-9 h-9 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center hover:bg-primary-50 transition-colors"
              >
                <Heart
                  size={16}
                  className={
                    wishlisted ? "fill-red-500 text-red-500" : "text-gray-400"
                  }
                />
              </button>
            </div>

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-2.5">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`aspect-square rounded-xl border-2 bg-gray-50 overflow-hidden transition-all ${
                      activeImg === i
                        ? "border-primary-600"
                        : "border-gray-100 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="flex flex-col gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-primary-600 uppercase tracking-widest">
                  {product.brand}
                </span>
                {product.stock > 0 ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    <Check size={11} /> In stock
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
              <div className="flex items-center gap-3">
                <StarRow count={15} filled={Math.round(product.rating || 0)} />
                <span className="text-sm font-semibold text-gray-800">
                  {product.rating || 0}
                </span>
                <span className="text-sm text-gray-400">
                  ({product.reviewCount?.toLocaleString() || 0} reviews)
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
            {product.colors?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-3">
                  Color —{" "}
                  <span className="font-normal text-gray-500">
                    {selectedColor || product.colors[0]}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                        (selectedColor || product.colors[0]) === color
                          ? "border-primary-600 bg-primary-50 text-primary-700 font-medium"
                          : "border-gray-200 text-gray-600 hover:border-gray-400"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
                { icon: Truck,     title: "Free delivery",       desc: "Estimated in 5–7 business days" },
                { icon: RefreshCw, title: "Free 30-day returns", desc: "Easy hassle-free returns"        },
                { icon: Shield,    title: "2-year warranty",     desc: "Official warranty included"      },
                { icon: Package,   title: "Secure packaging",    desc: "Tamper-proof sealed packaging"   },
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

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <div className="flex gap-0">
            {[
              { id: "description", label: "Description",    icon: MessageSquare },
              { id: "specs",       label: "Specifications", icon: Package       },
              {
                id:    "reviews",
                label: `Reviews (${product.reviewCount?.toLocaleString() || 0})`,
                icon:  Star,
              },
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
            <p className="text-gray-600 leading-relaxed text-sm">
              {product.description}
            </p>
          </div>
        )}

        {/* Specs tab */}
        {activeTab === "specs" && (
          <div className="max-w-2xl mb-12">
            {product.specifications?.length > 0 ? (
              <div className="border border-gray-100 rounded-2xl overflow-hidden">
                {product.specifications.map((spec, i) => (
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
            ) : (
              <p className="text-gray-400 text-sm">No specifications available.</p>
            )}
          </div>
        )}

        {/* Reviews tab */}
        {activeTab === "reviews" && (
          <ReviewsSection
            productId={id}
            productRating={product.rating}
            reviewCount={product.reviewCount}
          />
        )}

        {/* Related products */}
        {related.length > 0 && (
          <div className="border-t border-gray-100 pt-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Related products</h2>
              <Link
                to="/products"
                className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors"
              >
                View all <ChevronRight size={15} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {related.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;