import mongoose from "mongoose";
import slugify  from "slugify";

const productSchema = new mongoose.Schema(
  {
    name: {
      type:      String,
      required:  [true, "Product name is required"],
      trim:      true,
      maxlength: [200, "Product name cannot exceed 200 characters"],
    },
    slug: {
      type:   String,
      unique: true,
    },
    description: {
      type:     String,
      required: [true, "Description is required"],
    },
    price: {
      type:     Number,
      required: [true, "Price is required"],
      min:      [0, "Price cannot be negative"],
    },
    originalPrice: {
      type: Number,
      min:  [0, "Original price cannot be negative"],
    },
    category: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Category",
      required: [true, "Category is required"],
    },
    brand: {
      type:     String,
      required: [true, "Brand is required"],
      trim:     true,
    },
    images: [
      {
        public_id: { type: String, required: true },
        url:       { type: String, required: true },
      },
    ],
    stock: {
      type:    Number,
      required:[true, "Stock is required"],
      min:     [0, "Stock cannot be negative"],
      default: 0,
    },
    rating: {
      type:    Number,
      default: 0,
      min:     0,
      max:     5,
    },
    reviewCount: {
      type:    Number,
      default: 0,
    },
    specifications: [
      {
        label: String,
        value: String,
      },
    ],
    colors:   [String],
    sizes:    [String],
    tags:     [String],
    isActive:   { type: Boolean, default: true  },
    isFeatured: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },
    sold:       { type: Number,  default: 0     },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// Slug
productSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Virtual for discount percentage
productSchema.virtual("discountPercent").get(function () {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Index for search
productSchema.index({ name: "text", description: "text", brand: "text" });
productSchema.index({ category: 1, price: 1, rating: -1 });

const Product = mongoose.model("Product", productSchema);
export default Product;