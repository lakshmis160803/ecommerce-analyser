import express from "express";
import protect from "../../middleware/authMiddleware.js";

import {
  uploadOrders,
  getOrderStats,
  getOrdersByStatus,
  getOrdersByProduct,
  getOrdersByDate,
  getTopCustomers,
  getAllOrders
} from "./orderController.js";

const router = express.Router();

router.post("/upload", protect, uploadOrders);
router.get("/stats", protect, getOrderStats);
router.get("/status", protect, getOrdersByStatus);
router.get("/by-product", protect, getOrdersByProduct);
router.get("/by-date", protect, getOrdersByDate);
router.get("/top-customers", protect, getTopCustomers);
router.get("/all-orders", protect, getAllOrders);

export default router;