import Category from "../models/Category.js";
import Product  from "../models/Product.js";

export const getCategories = async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort("sortOrder");

  // Get product count for each category
  const categoriesWithCount = await Promise.all(
    categories.map(async (cat) => {
      const count = await Product.countDocuments({
        category: cat._id,
        isActive: true,
      });
      return { ...cat.toObject(), productCount: count };
    })
  );

  res.json({ success: true, categories: categoriesWithCount });
};


export const getCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }
  res.json({ success: true, category });
};


export const createCategory = async (req, res) => {
  const { name, description, sortOrder } = req.body;

  const exists = await Category.findOne({ name: { $regex: `^${name}$`, $options: "i" } });
  if (exists) {
    res.status(400);
    throw new Error("Category already exists");
  }

  const image = req.file
    ? { public_id: req.file.filename, url: req.file.path }
    : undefined;

  const category = await Category.create({
    name,
    description,
    sortOrder: sortOrder || 0,
    ...(image && { image }),
  });

  res.status(201).json({ success: true, category });
};


export const updateCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  const image = req.file
    ? { public_id: req.file.filename, url: req.file.path }
    : undefined;

  const updated = await Category.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      ...(image && { image }),
    },
    { new: true, runValidators: true }
  );

  res.json({ success: true, category: updated });
};


export const deleteCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  // Check if category has products
  const productCount = await Product.countDocuments({ category: category._id });
  if (productCount > 0) {
    res.status(400);
    throw new Error(`Cannot delete — ${productCount} products are using this category`);
  }

  await Category.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Category deleted successfully" });
};