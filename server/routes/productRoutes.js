import express from "express";
import {
  getProducts, getProduct, getFeaturedProducts,
  getRelatedProducts, createProduct,
  updateProduct, deleteProduct,
} from "../controllers/productController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { upload }         from "../middleware/uploadMiddleware.js";
import { uploadLimiter }  from "../middleware/rateLimiter.js";

const router = express.Router();

router.get   ("/",             getProducts);
router.get   ("/featured",     getFeaturedProducts);
router.get   ("/:id",          getProduct);
router.get   ("/:id/related",  getRelatedProducts);
router.post  ("/",             protect, admin, uploadLimiter, upload.array("images", 5), createProduct);
router.put   ("/:id",          protect, admin, updateProduct);
router.delete("/:id",          protect, admin, deleteProduct);

export default router;