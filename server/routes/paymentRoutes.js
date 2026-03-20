import express from "express";
import {
  createCheckoutSession,
  stripeWebhook,
  getStripeConfig,
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get ("/config",           getStripeConfig);
router.post("/checkout-session", protect, createCheckoutSession);
router.post("/webhook",          stripeWebhook);

export default router;