import express from "express";
import protect from "../../middleware/authMiddleware.js";
import authorize from "../../middleware/authorize.js";
import { uploadOrders } from "../orders/order.Controller.js";
import {
  uploadProducts,
  getUploads,
  getDashboardStats,
} from "./upload.Controller.js";
const router = express.Router();
router.get("/uploads", protect, authorize("viewer", "admin", "superadmin"), getUploads);
router.get("/dashboard", protect, authorize("viewer", "admin", "superadmin"), getDashboardStats);
router.get("/dashboard/:uploadId", authorize("viewer", "admin", "superadmin"), protect, getDashboardStats);
router.post("/products", protect, authorize("admin", "superadmin"), uploadProducts);
router.post("/orders", protect, authorize("admin", "superadmin"), uploadOrders);

export default router;