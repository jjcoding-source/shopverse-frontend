export const CATEGORIES = [
  { id: "electronics", label: "Electronics", icon: "📱" },
  { id: "fashion", label: "Fashion", icon: "👗" },
  { id: "home", label: "Home & Living", icon: "🏠" },
  { id: "beauty", label: "Beauty", icon: "💄" },
  { id: "sports", label: "Sports", icon: "⚽" },
  { id: "books", label: "Books", icon: "📚" },
];

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to high" },
  { value: "price-desc", label: "Price: High to low" },
  { value: "newest", label: "Newest arrivals" },
  { value: "rating", label: "Best rated" },
];

export const ORDER_STATUS = {
  processing: { label: "Processing", color: "bg-primary-50 text-primary-600" },
  shipped:    { label: "Shipped",    color: "bg-blue-50 text-blue-600" },
  transit:    { label: "In transit", color: "bg-amber-50 text-amber-700" },
  delivered:  { label: "Delivered",  color: "bg-green-50 text-green-700" },
  cancelled:  { label: "Cancelled",  color: "bg-red-50 text-red-600" },
};