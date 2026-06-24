import express from "express";
import {
  createProduct,
  getTopProducts,
  getCategoryStats,
  getRegionRevenue,
  getDashboardStats,
   getRatingDistribution,
   getCategoryDistribution,
   getPriceDistribution
} from "./productController.js";

const router = express.Router();

// ✅ All GET routes support ?uploadId=xxx for filtering by dataset
router.get("/dashboard/:uploadId", getDashboardStats); // filter by specific upload
router.get("/dashboard",           getDashboardStats); // all products (no filter)
router.get("/top-products",        getTopProducts);
router.get("/categories",          getCategoryStats);
router.get("/regions",             getRegionRevenue);
router.get("/rating-distribution", getRatingDistribution);
router.get("/category-distribution",getCategoryDistribution);
router.get("/price-distribution",getPriceDistribution);
router.post("/",                   createProduct);
export default router;