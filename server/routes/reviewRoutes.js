import express from "express";
import {
  getProductReviews,
  createReview,
  markHelpful,
  deleteReview,
  checkCanReview,
} from "../controllers/reviewController.js";
import { protect, optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get  ("/:productId",          optionalAuth, getProductReviews);
router.get  ("/:productId/can-review", protect,    checkCanReview);
router.post ("/:productId",          protect,      createReview);
router.put  ("/:id/helpful",         protect,      markHelpful);
router.delete("/:id",                protect,      deleteReview);

export default router;