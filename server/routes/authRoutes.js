import express        from "express";
import {
  register, login, logout, getMe,
  updateProfile, changePassword,
  refreshToken, toggleWishlist,
} from "../controllers/authController.js";
import { protect }    from "../middleware/authMiddleware.js";
import { authLimiter }from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/register",        authLimiter, register);
router.post("/login",           authLimiter, login);
router.post("/logout",          protect,     logout);
router.post("/refresh",                      refreshToken);
router.get ("/me",              protect,     getMe);
router.put ("/profile",         protect,     updateProfile);
router.put ("/change-password", protect,     changePassword);
router.put ("/wishlist/:productId", protect, toggleWishlist);

export default router;