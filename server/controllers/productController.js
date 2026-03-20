import Product     from "../models/Product.js";
import APIFeatures from "../utils/apiFeatures.js";


export const getProducts = async (req, res) => {
  const features = new APIFeatures(
    Product.find({ isActive: true }).populate("category", "name slug"),
    req.query
  )
    .search()
    .filter()
    .sort()
    .paginate(12);

  const [products, total] = await Promise.all([
    features.query,
    Product.countDocuments({ isActive: true }),
  ]);

  res.json({
    success:    true,
    count:      products.length,
    total,
    page:       features.page,
    totalPages: Math.ceil(total / features.limit),
    products,
  });
};


export const getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("category", "name slug");

  if (!product || !product.isActive) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json({ success: true, product });
};


export const getFeaturedProducts = async (req, res) => {
  const products = await Product.find({ isActive: true, isFeatured: true })
    .populate("category", "name slug")
    .limit(8)
    .sort("-createdAt");

  res.json({ success: true, products });
};


export const getRelatedProducts = async (req, res) => {
  const product  = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const related = await Product.find({
    _id:      { $ne: product._id },
    category: product.category,
    isActive: true,
  })
    .limit(4)
    .populate("category", "name slug");

  res.json({ success: true, products: related });
};


export const createProduct = async (req, res) => {
  const images = req.files?.map((file) => ({
    public_id: file.filename,
    url:       file.path,
  })) || [];

  const product = await Product.create({ ...req.body, images });
  res.status(201).json({ success: true, product });
};


export const updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json({ success: true, product });
};


export const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  product.isActive = false;
  await product.save();

  res.json({ success: true, message: "Product removed" });
};