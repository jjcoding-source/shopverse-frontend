import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Search, Edit2, Trash2,
  X, Check, Upload, Package,
  Tag, Image,
} from "lucide-react";
import { categoriesAPI } from "@/store/api/categoriesApi";
import toast from "react-hot-toast";

const CategoryModal = ({ category, onClose, onSave }) => {
  const [form, setForm] = useState({
    name:        category?.name        || "",
    description: category?.description || "",
    sortOrder:   category?.sortOrder   || 0,
  });
  const [imageFile,  setImageFile]  = useState(null);
  const [preview,    setPreview]    = useState(category?.image?.url || null);
  const [saving,     setSaving]     = useState(false);
  const fileRef = useRef();

  const update = (field, val) => setForm((p) => ({ ...p, [field]: val }));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name",        form.name.trim());
      formData.append("description", form.description);
      formData.append("sortOrder",   form.sortOrder);
      if (imageFile) formData.append("image", imageFile);

      if (category?._id) {
        await categoriesAPI.update(category._id, formData);
        toast.success("Category updated");
      } else {
        await categoriesAPI.create(formData);
        toast.success("Category created");
      }

      onSave();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">
            {category ? "Edit category" : "Add new category"}
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
              Category name <span className="text-red-400">*</span>
            </label>
            <input
              className="input-field"
              placeholder="e.g. Electronics"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">
              Description
            </label>
            <textarea
              className="input-field resize-none"
              rows={3}
              placeholder="Brief description of this category..."
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </div>

          {/* Sort order */}
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">
              Sort order
            </label>
            <input
              type="number"
              min="0"
              className="input-field"
              placeholder="0"
              value={form.sortOrder}
              onChange={(e) => update("sortOrder", e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">
              Lower numbers appear first
            </p>
          </div>

          {/* Image upload */}
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1.5">
              Category image
            </label>
            {preview ? (
              <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-100">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => { setPreview(null); setImageFile(null); }}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X size={12} className="text-white" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary-300 hover:bg-primary-50/30 transition-colors cursor-pointer"
              >
                <Upload size={24} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Click to upload image</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
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
            disabled={saving}
            className="flex-1 btn-primary flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check size={15} />
                {category ? "Save changes" : "Add category"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminCategories = () => {
  const queryClient = useQueryClient();

  const [search,      setSearch]      = useState("");
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editCat,     setEditCat]     = useState(null);
  const [deleteId,    setDeleteId]    = useState(null);
  const [deleteName,  setDeleteName]  = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn:  () => categoriesAPI.getAll().then((r) => r.data),
  });

  const categories = data?.categories || [];

  const filtered = categories.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    queryClient.invalidateQueries(["admin-categories"]);
    queryClient.invalidateQueries(["products"]);
  };

  const handleDelete = async () => {
    try {
      await categoriesAPI.delete(deleteId);
      queryClient.invalidateQueries(["admin-categories"]);
      toast.success("Category deleted");
      setDeleteId(null);
      setDeleteName("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete category");
      setDeleteId(null);
    }
  };

  const totalProducts = categories.reduce((sum, c) => sum + (c.productCount || 0), 0);

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {categories.length} categories · {totalProducts} total products
          </p>
        </div>
        <button
          onClick={() => { setEditCat(null); setModalOpen(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={15} />
          Add category
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total categories", value: categories.length,                                            color: "bg-primary-50 text-primary-600" },
          { label: "Total products",   value: totalProducts,                                                color: "bg-green-50 text-green-600"     },
          { label: "Largest category", value: categories.sort((a,b) => (b.productCount||0) - (a.productCount||0))[0]?.name || "—", color: "bg-amber-50 text-amber-600" },
          { label: "Empty categories", value: categories.filter((c) => !c.productCount).length,             color: "bg-red-50 text-red-500"         },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
              <Tag size={16} />
            </div>
            <p className="text-xl font-bold text-gray-900 truncate">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 flex-1 max-w-72 focus-within:border-primary-400 transition-colors">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search categories..."
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
        </div>

        {/* Grid view */}
        {isLoading ? (
          <div className="py-16 text-center text-sm text-gray-400">
            Loading categories...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Tag size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium text-sm">No categories found</p>
          </div>
        ) : (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((cat) => (
              <div
                key={cat._id}
                className="border border-gray-100 rounded-2xl overflow-hidden hover:border-primary-200 hover:shadow-sm transition-all group"
              >
                {/* Image */}
                <div className="h-32 bg-gray-50 flex items-center justify-center relative overflow-hidden">
                  {cat.image?.url ? (
                    <img
                      src={cat.image.url}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-200">
                      <Image size={32} />
                      <span className="text-xs">No image</span>
                    </div>
                  )}
                  {/* Actions overlay */}
                  <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => { setEditCat(cat); setModalOpen(true); }}
                      className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center hover:bg-primary-50 transition-colors border border-gray-100"
                    >
                      <Edit2 size={13} className="text-gray-500" />
                    </button>
                    <button
                      onClick={() => { setDeleteId(cat._id); setDeleteName(cat.name); }}
                      className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center hover:bg-red-50 transition-colors border border-gray-100"
                    >
                      <Trash2 size={13} className="text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{cat.name}</h3>
                    <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                      {cat.productCount || 0} products
                    </span>
                  </div>
                  {cat.description && (
                    <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                      {cat.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">
                      Sort order: {cat.sortOrder || 0}
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => { setEditCat(cat); setModalOpen(true); }}
                        className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors"
                      >
                        <Edit2 size={11} />
                        Edit
                      </button>
                      <span className="text-gray-200">·</span>
                      <button
                        onClick={() => { setDeleteId(cat._id); setDeleteName(cat.name); }}
                        className="flex items-center gap-1 text-xs font-medium text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={11} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit modal */}
      {modalOpen && (
        <CategoryModal
          category={editCat}
          onClose={() => { setModalOpen(false); setEditCat(null); }}
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
            <h3 className="text-center font-bold text-gray-900 mb-1">
              Delete "{deleteName}"?
            </h3>
            <p className="text-center text-sm text-gray-500 mb-5">
              This will permanently delete the category. Products in this category will not be deleted but will be uncategorized.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setDeleteId(null); setDeleteName(""); }}
                className="flex-1 btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
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

export default AdminCategories;