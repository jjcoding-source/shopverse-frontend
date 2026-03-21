import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Search, Edit2, Trash2,
  Package, Upload, X, Check, AlertCircle,
} from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import { productsAPI } from "@/store/api/productsApi";
import api from "@/utils/axiosInstance";
import toast from "react-hot-toast";

const STOCK_STATUS = {
  active: { label: "In stock",     color: "bg-green-50 text-green-600" },
  low:    { label: "Low stock",    color: "bg-amber-50 text-amber-600" },
  out:    { label: "Out of stock", color: "bg-red-50 text-red-500"     },
  draft:  { label: "Draft",        color: "bg-gray-100 text-gray-500"  },
};

const CATEGORIES = ["All", "Electronics", "Fashion", "Home", "Beauty", "Sports"];

const getStockStatus = (stock) => {
  if (stock === 0)  return "out";
  if (stock <= 5)   return "low";
  return "active";
};

const ProductModal = ({ product, onClose, onSave }) => {
  const [form, setForm] = useState(
    product
      ? {
          name:        product.name        || "",
          category:    product.category    || "Electronics",
          brand:       product.brand       || "",
          price:       product.price       || "",
          stock:       product.stock       || "",
          status:      product.status      || "active",
          description: product.description || "",
        }
      : {
          name: "", category: "Electronics", brand: "",
          price: "", stock: "", status: "active", description: "",
        }
  );

  const [images,    setImages]    = useState([]);
  const [previews,  setPreviews]  = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const update = (field, val) => setForm((p) => ({ ...p, [field]: val }));

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
  };

  const removePreview = (i) => {
    setPreviews((p) => p.filter((_, idx) => idx !== i));
    setImages((p)   => p.filter((_, idx) => idx !== i));
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Product name is required"); return; }
    if (!form.price)       { toast.error("Price is required");        return; }
    if (!form.brand.trim()){ toast.error("Brand is required");        return; }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("name",        form.name);
      formData.append("description", form.description || "No description provided");
      formData.append("price",       form.price);
      formData.append("stock",       form.stock || 0);
      formData.append("brand",       form.brand);
      formData.append("status",      form.status);
      formData.append("category",    form.category);
      images.forEach((img) => formData.append("images", img));

      if (product?._id) {
        await api.put(`/products/${product._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Product updated successfully");
      } else {
        await api.post("/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Product added successfully");
      }

      onSave();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save product");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">
            {product ? "Edit product" : "Add new product"}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">
              Product name <span className="text-red-400">*</span>
            </label>
            <input
              className="input-field"
              placeholder="Enter product name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>

          {/* Category + Brand */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1.5">Category</label>
              <select
                className="input-field"
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
              >
                {CATEGORIES.slice(1).map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                Brand <span className="text-red-400">*</span>
              </label>
              <input
                className="input-field"
                placeholder="Brand name"
                value={form.brand}
                onChange={(e) => update("brand", e.target.value)}
              />
            </div>
          </div>

          {/* Price + Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                Price ($) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min="0"
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
                min="0"
                className="input-field"
                placeholder="0"
                value={form.stock}
                onChange={(e) => update("stock", e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
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

          {/* Status */}
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

          {/* Image upload */}
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">
              Images
            </label>
            <div
              onClick={() => fileRef.current.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-primary-300 hover:bg-primary-50/30 transition-colors cursor-pointer"
            >
              <Upload size={24} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Click to upload images</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB each</p>
              <input
                ref={fileRef}
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Previews */}
            {previews.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-3">
                {previews.map((url, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-xl overflow-hidden border border-gray-100"
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removePreview(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
                    >
                      <X size={10} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Existing images when editing */}
            {product?.images?.length > 0 && previews.length === 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-400 mb-2">Current images</p>
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((img, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-xl overflow-hidden border border-gray-100"
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 btn-ghost">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={uploading}
            className="flex-1 btn-primary flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {product ? "Updating..." : "Adding..."}
              </>
            ) : (
              <>
                <Check size={15} />
                {product ? "Save changes" : "Add product"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminProducts = () => {
  const queryClient = useQueryClient();

  const [search,       setSearch]       = useState("");
  const [category,     setCategory]     = useState("All");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected,     setSelected]     = useState([]);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editProduct,  setEditProduct]  = useState(null);
  const [deleteId,     setDeleteId]     = useState(null);
  const [currentPage,  setCurrentPage]  = useState(1);

  // Fetch real products from backend
  const { data, isLoading } = useQuery({
    queryKey: ["admin-products", search, category, statusFilter, currentPage],
    queryFn:  () =>
      productsAPI.getAll({
        page:   currentPage,
        limit:  12,
        search: search || undefined,
      }).then((r) => r.data),
  });

  const products   = data?.products   || [];
  const total      = data?.total      || 0;
  const totalPages = data?.totalPages || 1;

  // Client-side filter for category and status
  const filtered = products.filter((p) => {
    if (category !== "All" && p.category?.name?.toLowerCase() !== category.toLowerCase()) return false;
    const stockStatus = getStockStatus(p.stock);
    if (statusFilter !== "all" && stockStatus !== statusFilter) return false;
    return true;
  });

  const toggleSelect = (id) =>
    setSelected((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id]
    );

  const toggleAll = () =>
    setSelected(
      selected.length === filtered.length ? [] : filtered.map((p) => p._id)
    );

  const handleSave = () => {
    queryClient.invalidateQueries(["admin-products"]);
    queryClient.invalidateQueries(["products"]);
    setEditProduct(null);
  };

  const handleDelete = async (id) => {
    try {
      await productsAPI.delete(id);
      queryClient.invalidateQueries(["admin-products"]);
      queryClient.invalidateQueries(["products"]);
      setDeleteId(null);
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selected.map((id) => productsAPI.delete(id)));
      queryClient.invalidateQueries(["admin-products"]);
      queryClient.invalidateQueries(["products"]);
      setSelected([]);
      toast.success(`${selected.length} products deleted`);
    } catch {
      toast.error("Failed to delete some products");
    }
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total products</p>
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
          { label: "Total products", value: total,                                                                     color: "text-gray-900"  },
          { label: "Active",         value: products.filter((p) => getStockStatus(p.stock) === "active").length,       color: "text-green-600" },
          { label: "Low stock",      value: products.filter((p) => getStockStatus(p.stock) === "low").length,          color: "text-amber-600" },
          { label: "Out of stock",   value: products.filter((p) => getStockStatus(p.stock) === "out").length,          color: "text-red-500"   },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
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
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
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
          {isLoading ? (
            <div className="py-16 text-center text-sm text-gray-400">
              Loading products...
            </div>
          ) : (
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
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((product) => {
                  const stockStatus = getStockStatus(product.stock);
                  const statusCfg   = STOCK_STATUS[stockStatus];
                  return (
                    <tr
                      key={product._id}
                      className={`hover:bg-gray-50 transition-colors ${
                        selected.includes(product._id) ? "bg-primary-50" : ""
                      }`}
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
                          <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                            {product.images?.[0]?.url ? (
                              <img
                                src={product.images[0].url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package size={16} className="text-gray-300" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-400">{product.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-500">
                        {product.category?.name || product.category}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-gray-900">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {product.stock < 5 && product.stock > 0 && (
                            <AlertCircle size={12} className="text-amber-500 shrink-0" />
                          )}
                          <span
                            className={`text-sm font-medium ${
                              product.stock === 0
                                ? "text-red-500"
                                : product.stock < 10
                                ? "text-amber-600"
                                : "text-gray-900"
                            }`}
                          >
                            {product.stock}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600 text-sm">
                        {product.sold || 0}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-medium text-amber-600">
                          ★ {product.rating?.toFixed(1) || "0.0"}
                        </span>
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
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="py-16 text-center">
              <Package size={36} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium text-sm">No products found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Showing {filtered.length} of {total} products
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                    currentPage === p
                      ? "bg-primary-600 text-white"
                      : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
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
              <button onClick={() => setDeleteId(null)} className="flex-1 btn-ghost">
                Cancel
              </button>
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