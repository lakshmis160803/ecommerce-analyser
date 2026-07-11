import express from "express";
import protect from "../../middleware/authMiddleware.js";
import {
  
  getTopProducts,
  getCategoryStats,
  getRegionRevenue,
  getDashboardStats,
  getRatingDistribution,
  getCategoryDistribution,
  getPriceDistribution,
  getAllProducts
} from "./product.Controller.js";
import authorize from "../../middleware/authorize.js";

const router = express.Router();

router.get("/dashboard/:uploadId", protect, getDashboardStats);
router.get("/dashboard", protect, authorize("viewer", "admin", "superadmin"), getDashboardStats);
router.get("/top-products", protect, getTopProducts);
router.get("/categories", protect, getCategoryStats);
router.get("/regions", protect, getRegionRevenue);
router.get("/rating-distribution", protect, getRatingDistribution);
router.get("/category-distribution", protect, getCategoryDistribution);
router.get("/price-distribution", protect, getPriceDistribution);
router.get("/all-products", protect, getAllProducts);

export default router;