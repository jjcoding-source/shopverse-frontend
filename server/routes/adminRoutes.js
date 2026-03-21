import express from "express";
import {
  getDashboardStats,
  getAllUsers,
  updateUser,
  getAllOrders,
  getRevenueAnalytics,
  getFullAnalytics,
} from "../controllers/adminController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, admin);

router.get("/stats",             getDashboardStats);
router.get("/users",             getAllUsers);
router.put("/users/:id",         updateUser);
router.get("/orders",            getAllOrders);
router.get("/analytics/revenue", getRevenueAnalytics);
router.get("/analytics",         getFullAnalytics);

export default router;