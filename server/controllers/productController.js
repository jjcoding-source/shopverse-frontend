import Product     from "../models/Product.js";
import Category    from "../models/Category.js";
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
  const product = await Product.findById(req.params.id);
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
  console.log("--- createProduct called ---");
  console.log("req.body:", req.body);
  console.log("req.files:", req.files);

const images = req.files?.map((file) => {
  console.log("File from multer:", {
    fieldname:  file.fieldname,
    filename:   file.filename,
    path:       file.path,
    mimetype:   file.mimetype,
  });

  return {
    public_id: file.filename,
    url:       file.path,
  };
}) || [];

  console.log("images:", images);

  let categoryId = req.body.category;
  console.log("categoryId before resolve:", categoryId);

  if (categoryId) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(categoryId);
    if (!isObjectId) {
      const cat = await Category.findOne({
        name: { $regex: `^${categoryId}$`, $options: "i" },
      });
      categoryId = cat ? cat._id : (await Category.create({ name: categoryId }))._id;
    }
  }

  console.log("categoryId after resolve:", categoryId);

  const productData = {
    name:        req.body.name        || "Unnamed product",
    description: req.body.description || "No description",
    price:       Number(req.body.price) || 0,
    stock:       Number(req.body.stock) || 0,
    brand:       req.body.brand       || "Unknown",
    category:    categoryId,
    images,
  };

  console.log("productData:", productData);

  const product = await Product.create(productData);
  console.log("product created:", product._id);

  await product.populate("category", "name slug");
  res.status(201).json({ success: true, product });
};


export const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Handle new images if uploaded
  const newImages = req.files?.map((file) => ({
    public_id: file.filename,
    url:       file.path,
  }));

  let categoryId = req.body.category;
  if (categoryId) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(categoryId);
    if (!isObjectId) {
      const cat = await Category.findOne({
        name: { $regex: `^${categoryId}$`, $options: "i" },
      });
      if (cat) categoryId = cat._id;
    }
  }

  // Build update object
  const updateData = {
    ...(req.body.name        && { name:        req.body.name        }),
    ...(req.body.description && { description: req.body.description }),
    ...(req.body.price       && { price:       Number(req.body.price) }),
    ...(req.body.stock !== undefined && { stock: Number(req.body.stock) }),
    ...(req.body.brand       && { brand:       req.body.brand       }),
    ...(categoryId           && { category:    categoryId           }),
    ...(newImages?.length    && { images:      newImages            }),
  };

  const updated = await Product.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).populate("category", "name slug");

  res.json({ success: true, product: updated });
};


export const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  product.isActive = false;
  await product.save();

  res.json({ success: true, message: "Product removed successfully" });
};