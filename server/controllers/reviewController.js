import Review  from "../models/Review.js";
import Order   from "../models/Order.js";


export const getProductReviews = async (req, res) => {
  const page  = Number(req.query.page)  || 1;
  const limit = Number(req.query.limit) || 10;
  const skip  = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find({ product: req.params.productId })
      .populate("user", "name avatar")
      .sort("-createdAt")
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ product: req.params.productId }),
  ]);

  res.json({
    success: true,
    reviews,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
};


export const createReview = async (req, res) => {
  const { rating, title, body } = req.body;
  const productId = req.params.productId;

  // Check if already reviewed
  const existing = await Review.findOne({
    user:    req.user._id,
    product: productId,
  });

  if (existing) {
    res.status(400);
    throw new Error("You have already reviewed this product");
  }

  // Check if user purchased this product
  const hasPurchased = await Order.findOne({
    user:            req.user._id,
    "items.product": productId,
    status:          "delivered",
  });

  const review = await Review.create({
    user:       req.user._id,
    product:    productId,
    rating,
    title,
    body,
    isVerified: !!hasPurchased,
  });

  await review.populate("user", "name avatar");
  res.status(201).json({ success: true, review });
};


export const markHelpful = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  const alreadyVoted = review.helpfulVotes.includes(req.user._id);
  if (alreadyVoted) {
    review.helpfulVotes.pull(req.user._id);
    review.helpful = Math.max(0, review.helpful - 1);
  } else {
    review.helpfulVotes.push(req.user._id);
    review.helpful += 1;
  }

  await review.save();
  res.json({ success: true, helpful: review.helpful });
};


export const deleteReview = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  if (
    review.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized");
  }

  await review.remove();
  res.json({ success: true, message: "Review deleted" });
};