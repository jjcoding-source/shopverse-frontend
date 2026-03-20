import mongoose from "mongoose";
import slugify  from "slugify";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, "Category name is required"],
      unique:   true,
      trim:     true,
    },
    slug: {
      type:   String,
      unique: true,
    },
    description: String,
    image: {
      public_id: String,
      url:       String,
    },
    isActive: { type: Boolean, default: true },
    sortOrder:{ type: Number,  default: 0    },
  },
  { timestamps: true }
);

categorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

const Category = mongoose.model("Category", categorySchema);
export default Category;