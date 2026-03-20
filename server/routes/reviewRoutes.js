import express from "express";
import {
  getProductReviews,
  createReview,
  markHelpful,
  deleteReview,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get ("/:productId",         getProductReviews);
router.post("/:productId",         protect, createReview);
router.put ("/:id/helpful",        protect, markHelpful);
router.delete("/:id",              protect, deleteReview);

export default router;