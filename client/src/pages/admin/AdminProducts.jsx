import { useState } from "react";
import {
  Plus, Search, Filter, Edit2, Trash2,
  Eye, MoreHorizontal, Package, Upload,
  ChevronDown, X, Check, AlertCircle,
} from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import toast from "react-hot-toast";

const INITIAL_PRODUCTS = [
  { _id: "1", name: "Sony WH-1000XM5 Headphones",      category: "Electronics", brand: "Sony",    price: 279,  stock: 24,  status: "active",  sold: 482, rating: 4.9 },
  { _id: "2", name: "Apple Watch Series 10",            category: "Electronics", brand: "Apple",   price: 399,  stock: 8,   status: "active",  sold: 306, rating: 4.8 },
  { _id: "3", name: "Urban Runner Sneakers",            category: "Fashion",     brand: "Nike",    price: 64,   stock: 120, status: "active",  sold: 654, rating: 4.7 },
  { _id: "4", name: "Ergonomic Mesh Desk Chair",        category: "Home",        brand: "Herman",  price: 220,  stock: 4,   status: "low",     sold: 89,  rating: 4.5 },
  { _id: "5", name: "Smart Watch Series X",             category: "Electronics", brand: "Samsung", price: 149,  stock: 0,   status: "out",     sold: 212, rating: 4.9 },
  { _id: "6", name: "Bose QuietComfort Ultra Earbuds",  category: "Electronics", brand: "Bose",    price: 179,  stock: 31,  status: "active",  sold: 178, rating: 4.6 },
  { _id: "7", name: "Premium Cotton Oversized Hoodie",  category: "Fashion",     brand: "Zara",    price: 49,   stock: 88,  status: "active",  sold: 340, rating: 4.4 },
  { _id: "8", name: "Ceramic Pour-Over Coffee Set",     category: "Home",        brand: "Fellow",  price: 38,   stock: 0,   status: "out",     sold: 95,  rating: 4.7 },
  { _id: "9", name: "MacBook Air M3 15-inch",           category: "Electronics", brand: "Apple",   price: 1099, stock: 5,   status: "low",     sold: 87,  rating: 4.9 },
  { _id: "10",name: "Sony Alpha A7C II Camera",         category: "Electronics", brand: "Sony",    price: 2199, stock: 12,  status: "active",  sold: 44,  rating: 4.8 },
  { _id: "11",name: "Linen Wide-Leg Trousers",          category: "Fashion",     brand: "Zara",    price: 72,   stock: 55,  status: "active",  sold: 189, rating: 4.3 },
  { _id: "12",name: "Scented Soy Candle Set",           category: "Home",        brand: "Diptyque",price: 28,   stock: 3,   status: "low",     sold: 201, rating: 4.6 },
];

const STOCK_STATUS = {
  active: { label: "In stock",    color: "bg-green-50 text-green-600"   },
  low:    { label: "Low stock",   color: "bg-amber-50 text-amber-600"   },
  out:    { label: "Out of stock",color: "bg-red-50 text-red-500"       },
  draft:  { label: "Draft",       color: "bg-gray-100 text-gray-500"    },
};

const CATEGORIES = ["All", "Electronics", "Fashion", "Home", "Beauty", "Sports"];

const ProductModal = ({ product, onClose, onSave }) => {
  const [form, setForm] = useState(
    product || { name: "", category: "Electronics", brand: "", price: "", stock: "", status: "active", description: "" }
  );

  const update = (field, val) => setForm((p) => ({ ...p, [field]: val }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">
            {product ? "Edit product" : "Add new product"}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">Product name</label>
            <input
              className="input-field"
              placeholder="Enter product name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1.5">Category</label>
              <select
                className="input-field"
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
              >
                {CATEGORIES.slice(1).map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1.5">Brand</label>
              <input
                className="input-field"
                placeholder="Brand name"
                value={form.brand}
                onChange={(e) => update("brand", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1.5">Price ($)</label>
              <input
                type="number"
                className="input-field"
                placeholder="0.00"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1.5">Stock</label>
              <input
                type="number"
                className="input-field"
                placeholder="0"
                value={form.stock}
                onChange={(e) => update("stock", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">Description</label>
            <textarea
              className="input-field resize-none"
              rows={3}
              placeholder="Product description..."
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">Status</label>
            <select
              className="input-field"
              value={form.status}
              onChange={(e) => update("status", e.target.value)}
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="out">Out of stock</option>
            </select>
          </div>

          {/* Image upload placeholder */}
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">Images</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-primary-300 transition-colors cursor-pointer">
              <Upload size={24} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Drop images here or click to upload</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB each</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 btn-ghost">Cancel</button>
          <button
            onClick={() => { onSave(form); onClose(); }}
            className="flex-1 btn-primary flex items-center justify-center gap-2"
          >
            <Check size={15} />
            {product ? "Save changes" : "Add product"}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminProducts = () => {
  const [products,    setProducts]    = useState(INITIAL_PRODUCTS);
  const [search,      setSearch]      = useState("");
  const [category,    setCategory]    = useState("All");
  const [statusFilter,setStatusFilter]= useState("all");
  const [selected,    setSelected]    = useState([]);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteId,    setDeleteId]    = useState(null);

  const filtered = products.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (category !== "All" && p.category !== category) return false;
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    return true;
  });

  const toggleSelect = (id) =>
    setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const toggleAll = () =>
    setSelected(selected.length === filtered.length ? [] : filtered.map((p) => p._id));

  const handleSave = (form) => {
    if (editProduct) {
      setProducts((p) => p.map((x) => x._id === editProduct._id ? { ...x, ...form } : x));
      toast.success("Product updated");
    } else {
      setProducts((p) => [...p, { ...form, _id: Date.now().toString(), sold: 0, rating: 0 }]);
      toast.success("Product added");
    }
    setEditProduct(null);
  };

  const handleDelete = (id) => {
    setProducts((p) => p.filter((x) => x._id !== id));
    setDeleteId(null);
    toast.success("Product deleted");
  };

  const handleBulkDelete = () => {
    setProducts((p) => p.filter((x) => !selected.includes(x._id)));
    setSelected([]);
    toast.success(`${selected.length} products deleted`);
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} total products</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-sm font-medium text-gray-600 border border-gray-200 bg-white px-4 py-2 rounded-xl hover:border-gray-300 transition-colors">
            <Upload size={14} />
            Import
          </button>
          <button
            onClick={() => { setEditProduct(null); setModalOpen(true); }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={15} />
            Add product
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total products", value: products.length,                                      color: "text-gray-900"   },
          { label: "Active",         value: products.filter((p) => p.status === "active").length,  color: "text-green-600"  },
          { label: "Low stock",      value: products.filter((p) => p.status === "low").length,     color: "text-amber-600"  },
          { label: "Out of stock",   value: products.filter((p) => p.status === "out").length,     color: "text-red-500"    },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters + table */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100">
          {/* Search */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 flex-1 min-w-48 max-w-72 focus-within:border-primary-400 transition-colors">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none flex-1"
            />
            {search && (
              <button onClick={() => setSearch("")}>
                <X size={13} className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Category filter */}
          <div className="flex gap-1.5 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  category === cat
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="ml-auto bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 outline-none focus:border-primary-400 cursor-pointer"
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
            <option value="draft">Draft</option>
          </select>

          {/* Bulk delete */}
          {selected.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 text-xs font-medium text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-xl hover:bg-red-100 transition-colors"
            >
              <Trash2 size={13} />
              Delete ({selected.length})
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selected.length === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                    className="accent-primary-600 w-4 h-4"
                  />
                </th>
                {["Product", "Category", "Price", "Stock", "Sold", "Rating", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((product) => {
                const statusCfg = STOCK_STATUS[product.status];
                return (
                  <tr
                    key={product._id}
                    className={`hover:bg-gray-50 transition-colors ${selected.includes(product._id) ? "bg-primary-50" : ""}`}
                  >
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={selected.includes(product._id)}
                        onChange={() => toggleSelect(product._id)}
                        className="accent-primary-600 w-4 h-4"
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center shrink-0">
                          <Package size={16} className="text-gray-300" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 line-clamp-1">{product.name}</p>
                          <p className="text-xs text-gray-400">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-500">{product.category}</td>
                    <td className="px-4 py-3.5 font-semibold text-gray-900">{formatPrice(product.price)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {product.stock < 5 && product.stock > 0 && (
                          <AlertCircle size={12} className="text-amber-500 shrink-0" />
                        )}
                        <span className={`text-sm font-medium ${product.stock === 0 ? "text-red-500" : product.stock < 10 ? "text-amber-600" : "text-gray-900"}`}>
                          {product.stock}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 text-sm">{product.sold}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-medium text-amber-600">★ {product.rating}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditProduct(product); setModalOpen(true); }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(product._id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <Package size={36} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium text-sm">No products found</p>
            </div>
          )}
        </div>

        {/* Pagination row */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Showing {filtered.length} of {products.length} products
          </p>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                  p === 1 ? "bg-primary-600 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Add/Edit modal */}
      {modalOpen && (
        <ProductModal
          product={editProduct}
          onClose={() => { setModalOpen(false); setEditProduct(null); }}
          onSave={handleSave}
        />
      )}

      {/* Delete confirm modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <h3 className="text-center font-bold text-gray-900 mb-1">Delete product?</h3>
            <p className="text-center text-sm text-gray-500 mb-5">
              This action cannot be undone. The product will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 btn-ghost">Cancel</button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;