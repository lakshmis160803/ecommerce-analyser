import express from "express";
import protect from "../../middleware/authMiddleware.js";
import authorize from "../../middleware/authorize.js";
import {
  uploadProducts,
  getUploads,
  getDashboardStats,
} from "./uploadController.js";
import { uploadOrders } from "../orders/orderController.js";

const router = express.Router();

router.get("/uploads", protect, getUploads);
router.get("/dashboard", protect, getDashboardStats);
router.get("/dashboard/:uploadId", protect, getDashboardStats);
router.post(
  "/products",
  protect,
  authorize("admin", "superadmin"),
  uploadProducts
);

router.post(
  "/orders",
  protect,
  authorize("admin", "superadmin"),
  uploadOrders
);

export default router;