import mongoose from "mongoose";
import Product  from "./Product.js";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    product: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Product",
      required: true,
    },
    rating: {
      type:     Number,
      required: [true, "Rating is required"],
      min:      1,
      max:      5,
    },
    title: {
      type:      String,
      required:  [true, "Review title is required"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    body: {
      type:      String,
      required:  [true, "Review body is required"],
      maxlength: [1000, "Review cannot exceed 1000 characters"],
    },
    isVerified:   { type: Boolean, default: false },
    helpful:      { type: Number,  default: 0     },
    helpfulVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

reviewSchema.index({ user: 1, product: 1 }, { unique: true });

reviewSchema.statics.calcAverageRating = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id:   "$product",
        avg:   { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating:      Math.round(stats[0].avg * 10) / 10,
      reviewCount: stats[0].count,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      rating:      0,
      reviewCount: 0,
    });
  }
};

reviewSchema.post("save", async function () {
  await this.constructor.calcAverageRating(this.product);
});

reviewSchema.post("deleteOne", { document: true, query: false }, async function () {
  await this.constructor.calcAverageRating(this.product);
});

const Review = mongoose.model("Review", reviewSchema);
export default Review;