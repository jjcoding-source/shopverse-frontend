import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  Search,
  LayoutGrid,
  List,
  Star,
} from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import Pagination from "@/components/common/Pagination";
import Loader from "@/components/common/Loader";
import { SORT_OPTIONS, CATEGORIES } from "@/utils/constants";
import { useDebounce } from "@/hooks/useDebounce";

const MOCK_PRODUCTS = [
  { _id: "1",  name: "Sony WH-1000XM5 Wireless Headphones",      price: 279,  originalPrice: 349,  category: "electronics", brand: "Sony",    rating: 4.9, reviewCount: 3241, stock: 10, isNew: false, isFeatured: true,  images: [] },
  { _id: "2",  name: "Apple Watch Series 10 — 42mm",              price: 399,  originalPrice: null, category: "electronics", brand: "Apple",   rating: 4.8, reviewCount: 5102, stock: 6,  isNew: true,  isFeatured: false, images: [] },
  { _id: "3",  name: "Urban Runner Sneakers",                      price: 64,   originalPrice: 80,   category: "fashion",     brand: "Nike",    rating: 4.7, reviewCount: 876,  stock: 20, isNew: true,  isFeatured: false, images: [] },
  { _id: "4",  name: "Ergonomic Mesh Desk Chair",                  price: 220,  originalPrice: null, category: "home",        brand: "Herman",  rating: 4.5, reviewCount: 340,  stock: 4,  isNew: false, isFeatured: false, images: [] },
  { _id: "5",  name: "Smart Watch Series X Fitness Tracker",       price: 149,  originalPrice: 229,  category: "electronics", brand: "Samsung", rating: 4.9, reviewCount: 4312, stock: 15, isNew: false, isFeatured: true,  images: [] },
  { _id: "6",  name: "Bose QuietComfort Ultra Earbuds",            price: 179,  originalPrice: null, category: "electronics", brand: "Bose",    rating: 4.6, reviewCount: 1420, stock: 8,  isNew: false, isFeatured: false, images: [] },
  { _id: "7",  name: "Premium Cotton Oversized Hoodie",            price: 49,   originalPrice: 65,   category: "fashion",     brand: "Zara",    rating: 4.4, reviewCount: 628,  stock: 30, isNew: true,  isFeatured: false, images: [] },
  { _id: "8",  name: "Ceramic Pour-Over Coffee Set",               price: 38,   originalPrice: null, category: "home",        brand: "Fellow",  rating: 4.7, reviewCount: 219,  stock: 12, isNew: false, isFeatured: false, images: [] },
  { _id: "9",  name: "MacBook Air M3 15-inch Laptop",              price: 1099, originalPrice: null, category: "electronics", brand: "Apple",   rating: 4.9, reviewCount: 987,  stock: 5,  isNew: true,  isFeatured: true,  images: [] },
  { _id: "10", name: "Sony Alpha A7C II Mirrorless Camera",        price: 2199, originalPrice: null, category: "electronics", brand: "Sony",    rating: 4.8, reviewCount: 562,  stock: 3,  isNew: false, isFeatured: false, images: [] },
  { _id: "11", name: "Linen Wide-Leg Trousers",                    price: 72,   originalPrice: 90,   category: "fashion",     brand: "Zara",    rating: 4.3, reviewCount: 411,  stock: 18, isNew: true,  isFeatured: false, images: [] },
  { _id: "12", name: "Scented Soy Candle Set — Lavender & Cedar", price: 28,   originalPrice: null, category: "home",        brand: "Diptyque",rating: 4.6, reviewCount: 304,  stock: 25, isNew: false, isFeatured: false, images: [] },
];

const BRANDS = ["Apple", "Sony", "Samsung", "Bose", "Nike", "Zara", "Herman", "Fellow", "Diptyque"];
const RATINGS = [4, 3, 2, 1];

const PRICE_RANGES = [
  { label: "Under $50",       min: 0,    max: 50   },
  { label: "$50 – $150",      min: 50,   max: 150  },
  { label: "$150 – $500",     min: 150,  max: 500  },
  { label: "$500 – $1,000",   min: 500,  max: 1000 },
  { label: "Over $1,000",     min: 1000, max: Infinity },
];

const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 py-4">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center justify-between w-full text-sm font-semibold text-gray-800 hover:text-primary-600 transition-colors"
      >
        {title}
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>
      {open && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  );
};

const ProductListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch]           = useState(searchParams.get("search") || "");
  const [selectedCats, setSelectedCats] = useState(
    searchParams.get("category") ? [searchParams.get("category")] : []
  );
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedRating, setSelectedRating] = useState(null);
  const [selectedPrice, setSelectedPrice]   = useState(null);
  const [sortBy, setSortBy]                 = useState("featured");
  const [viewMode, setViewMode]             = useState("grid");
  const [currentPage, setCurrentPage]       = useState(1);
  const [drawerOpen, setDrawerOpen]         = useState(false);

  const debouncedSearch = useDebounce(search, 350);
  const ITEMS_PER_PAGE = 8;

  const toggleCat = (id) =>
    setSelectedCats((p) =>
      p.includes(id) ? p.filter((c) => c !== id) : [...p, id]
    );

  const toggleBrand = (b) =>
    setSelectedBrands((p) =>
      p.includes(b) ? p.filter((x) => x !== b) : [...p, b]
    );

  const clearAll = () => {
    setSelectedCats([]);
    setSelectedBrands([]);
    setSelectedRating(null);
    setSelectedPrice(null);
    setSearch("");
  };

  const activeFilterCount =
    selectedCats.length +
    selectedBrands.length +
    (selectedRating ? 1 : 0) +
    (selectedPrice ? 1 : 0);

  const filtered = MOCK_PRODUCTS.filter((p) => {
    if (debouncedSearch && !p.name.toLowerCase().includes(debouncedSearch.toLowerCase())) return false;
    if (selectedCats.length && !selectedCats.includes(p.category)) return false;
    if (selectedBrands.length && !selectedBrands.includes(p.brand)) return false;
    if (selectedRating && p.rating < selectedRating) return false;
    if (selectedPrice) {
      if (p.price < selectedPrice.min || p.price > selectedPrice.max) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "price-asc")  return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "rating")     return b.rating - a.rating;
    if (sortBy === "newest")     return b.isNew - a.isNew;
    return b.isFeatured - a.isFeatured;
  });

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paginated  = sorted.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, selectedCats, selectedBrands, selectedRating, selectedPrice, sortBy]);

  const Filters = () => (
    <div className="space-y-0">
      {/* Search within */}
      <div className="pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus-within:border-primary-400 transition-colors">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none"
          />
          {search && (
            <button onClick={() => setSearch("")}>
              <X size={13} className="text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Category */}
      <FilterSection title="Category">
        {CATEGORIES.map((cat) => (
          <label key={cat.id} className="flex items-center justify-between gap-2 cursor-pointer group">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedCats.includes(cat.id)}
                onChange={() => toggleCat(cat.id)}
                className="accent-primary-600 w-3.5 h-3.5"
              />
              <span className="text-sm text-gray-600 group-hover:text-primary-600 transition-colors">
                {cat.label}
              </span>
            </div>
            <span className="text-xs text-gray-400">
              {MOCK_PRODUCTS.filter((p) => p.category === cat.id).length}
            </span>
          </label>
        ))}
      </FilterSection>

      {/* Brand */}
      <FilterSection title="Brand">
        {BRANDS.map((brand) => (
          <label key={brand} className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={selectedBrands.includes(brand)}
              onChange={() => toggleBrand(brand)}
              className="accent-primary-600 w-3.5 h-3.5"
            />
            <span className="text-sm text-gray-600 group-hover:text-primary-600 transition-colors">
              {brand}
            </span>
          </label>
        ))}
      </FilterSection>

      {/* Price */}
      <FilterSection title="Price range">
        {PRICE_RANGES.map((range) => (
          <label key={range.label} className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="price"
              checked={selectedPrice?.label === range.label}
              onChange={() =>
                setSelectedPrice(
                  selectedPrice?.label === range.label ? null : range
                )
              }
              className="accent-primary-600 w-3.5 h-3.5"
            />
            <span className="text-sm text-gray-600 group-hover:text-primary-600 transition-colors">
              {range.label}
            </span>
          </label>
        ))}
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Minimum rating">
        {RATINGS.map((r) => (
          <label key={r} className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="rating"
              checked={selectedRating === r}
              onChange={() =>
                setSelectedRating(selectedRating === r ? null : r)
              }
              className="accent-primary-600 w-3.5 h-3.5"
            />
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={12}
                  className={
                    s <= r
                      ? "fill-amber-400 text-amber-400"
                      : "fill-gray-200 text-gray-200"
                  }
                />
              ))}
              <span className="text-xs text-gray-500 ml-1">& up</span>
            </div>
          </label>
        ))}
      </FilterSection>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {selectedCats.length === 1
              ? CATEGORIES.find((c) => c.id === selectedCats[0])?.label || "All products"
              : "All products"}
          </h1>
          <p className="text-sm text-gray-500">
            {sorted.length} product{sorted.length !== 1 ? "s" : ""} found
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">

          {/* ── Desktop Sidebar ── */}
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 text-sm">Filters</h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-xs text-primary-600 hover:text-primary-800 font-medium transition-colors"
                  >
                    Clear all ({activeFilterCount})
                  </button>
                )}
              </div>
              <Filters />
            </div>
          </aside>

          {/* ── Main content ── */}
          <main className="flex-1 min-w-0">

            {/* Toolbar */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              {/* Mobile filter button */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-primary-300 transition-colors"
              >
                <SlidersHorizontal size={15} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Active filter tags */}
              <div className="flex flex-wrap gap-2 flex-1">
                {selectedCats.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 border border-primary-100 text-xs font-medium px-3 py-1.5 rounded-full"
                  >
                    {CATEGORIES.find((x) => x.id === c)?.label}
                    <button onClick={() => toggleCat(c)}>
                      <X size={11} />
                    </button>
                  </span>
                ))}
                {selectedBrands.map((b) => (
                  <span
                    key={b}
                    className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 border border-primary-100 text-xs font-medium px-3 py-1.5 rounded-full"
                  >
                    {b}
                    <button onClick={() => toggleBrand(b)}>
                      <X size={11} />
                    </button>
                  </span>
                ))}
                {selectedPrice && (
                  <span className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 border border-primary-100 text-xs font-medium px-3 py-1.5 rounded-full">
                    {selectedPrice.label}
                    <button onClick={() => setSelectedPrice(null)}>
                      <X size={11} />
                    </button>
                  </span>
                )}
                {selectedRating && (
                  <span className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 border border-primary-100 text-xs font-medium px-3 py-1.5 rounded-full">
                    {selectedRating}+ stars
                    <button onClick={() => setSelectedRating(null)}>
                      <X size={11} />
                    </button>
                  </span>
                )}
              </div>

              {/* Sort + view */}
              <div className="flex items-center gap-2 ml-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-primary-400 transition-colors cursor-pointer"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
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
                    <LayoutGrid size={15} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === "list"
                        ? "bg-primary-600 text-white"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <List size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* Product grid */}
            {paginated.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
                <Search size={40} className="text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No products found</p>
                <p className="text-sm text-gray-400 mt-1 mb-4">
                  Try adjusting your filters or search term
                </p>
                <button
                  onClick={clearAll}
                  className="btn-outline text-sm"
                >
                  Clear all filters
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginated.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {paginated.map((p) => (
                  <div
                    key={p._id}
                    className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4 hover:border-primary-200 hover:shadow-sm transition-all"
                  >
                    <div className="w-28 h-28 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                      <LayoutGrid size={28} className="text-gray-200" />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <p className="text-xs text-primary-600 font-medium uppercase tracking-wider mb-1">
                        {p.category}
                      </p>
                      <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">
                        {p.name}
                      </h3>
                      <div className="flex items-center gap-1 mb-2">
                        {[1,2,3,4,5].map((s) => (
                          <Star
                            key={s}
                            size={11}
                            className={s <= Math.round(p.rating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}
                          />
                        ))}
                        <span className="text-xs text-gray-400 ml-1">
                          {p.rating} ({p.reviewCount?.toLocaleString()})
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-bold text-gray-900">
                            ${p.price}
                          </span>
                          {p.originalPrice && (
                            <span className="text-xs text-gray-400 line-through">
                              ${p.originalPrice}
                            </span>
                          )}
                        </div>
                        <button className="btn-primary text-xs px-4 py-2">
                          Add to cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </main>
        </div>
      </div>

      {/* ── Mobile filter drawer ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-2">
              <Filters />
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => { clearAll(); setDrawerOpen(false); }}
                className="flex-1 btn-outline text-sm"
              >
                Clear all
              </button>
              <button
                onClick={() => setDrawerOpen(false)}
                className="flex-1 btn-primary text-sm"
              >
                Show {sorted.length} results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductListing;