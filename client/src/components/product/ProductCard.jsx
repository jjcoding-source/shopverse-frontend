import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Star, Eye } from "lucide-react";
import { useCart }      from "@/hooks/useCart";
import { useWishlist }  from "@/hooks/useWishlist";
import { formatPrice, calcDiscount } from "@/utils/formatPrice";

const ProductCard = ({ product }) => {
  const { addItem }              = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const navigate                 = useNavigate();
  const [adding, setAdding]      = useState(false);

  const {
    _id, name, price, originalPrice,
    images, category, rating,
    reviewCount, stock, isNew,
    newArrival, isFeatured,
  } = product;

  const categoryName =
    typeof category === "object" && category !== null
      ? category.name
      : category || "";

  const discount =
    originalPrice && originalPrice > price
      ? calcDiscount(originalPrice, price)
      : null;

  const wishlisted = isWishlisted(_id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    addItem({
      _id,
      name,
      price,
      image:         images?.[0]?.url || images?.[0],
      category:      categoryName,
      selectedColor: null,
      selectedSize:  null,
      quantity:      1,
    });
    import("react-hot-toast").then(({ default: toast }) => {
      toast.success(`${name} added to cart`);
    });
    setTimeout(() => setAdding(false), 600);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(_id);
  };

  const handleEyeClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/products/${_id}`);
  };

  return (
    <Link
      to={`/products/${_id}`}
      className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-primary-200 hover:shadow-md transition-all duration-200 flex flex-col"
    >
      {/* Image area */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {images?.[0]?.url || images?.[0] ? (
          <img
            src={images[0]?.url || images[0]}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingCart size={40} className="text-gray-200" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount && (
            <span className="badge bg-red-500 text-white text-[10px] px-2 py-0.5">
              -{discount}%
            </span>
          )}
          {(isNew || newArrival) && (
            <span className="badge bg-green-500 text-white text-[10px] px-2 py-0.5">
              New
            </span>
          )}
          {isFeatured && (
            <span className="badge bg-primary-600 text-white text-[10px] px-2 py-0.5">
              Featured
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-200">
          <button
            onClick={handleWishlist}
            className="w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center hover:bg-primary-50 transition-colors border border-gray-100"
          >
            <Heart
              size={14}
              className={
                wishlisted
                  ? "fill-red-500 text-red-500"
                  : "text-gray-400"
              }
            />
          </button>
          <button
            onClick={handleEyeClick}
            className="w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center hover:bg-primary-50 transition-colors border border-gray-100"
          >
            <Eye size={14} className="text-gray-400" />
          </button>
        </div>

        {/* Out of stock overlay */}
        {stock === 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
              Out of stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <p className="text-xs text-primary-600 font-medium uppercase tracking-wider">
          {categoryName}
        </p>
        <h3 className="text-sm font-medium text-gray-900 leading-snug line-clamp-2 group-hover:text-primary-700 transition-colors">
          {name}
        </h3>

        {rating > 0 && (
          <div className="flex items-center gap-1.5">
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
            <span className="text-xs text-gray-400">
              {rating.toFixed(1)} ({reviewCount?.toLocaleString()})
            </span>
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-semibold text-gray-900">
              {formatPrice(price)}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={stock === 0 || adding}
            className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-800 disabled:bg-gray-200 disabled:cursor-not-allowed text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
          >
            <ShoppingCart size={13} />
            {adding ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;