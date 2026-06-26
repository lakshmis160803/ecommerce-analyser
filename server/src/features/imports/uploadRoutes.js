import express from "express";
import protect from "../../middleware/authMiddleware.js"; // adjust path to your actual file
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
router.post("/products", protect, uploadProducts);
router.post("/orders", protect, uploadOrders);

export default router;