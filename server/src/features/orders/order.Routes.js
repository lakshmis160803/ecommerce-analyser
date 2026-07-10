import express from "express";
import protect from "../../middleware/authMiddleware.js";
import authorize from "../../middleware/authorize.js"

import {
  uploadOrders,
  getOrderStats,
  getOrdersByStatus,
  getOrdersByProduct,
  getOrdersByDate,
  getTopCustomers,
  getAllOrders
} from "./order.Controller.js";

const router = express.Router();

router.post("/upload", protect, authorize("viewer", "admin", "superadmin"), uploadOrders);
router.get("/stats", protect, authorize("viewer", "admin", "superadmin"), getOrderStats);
router.get("/status", protect, authorize("viewer", "admin", "superadmin"), getOrdersByStatus);
router.get("/by-product", protect, authorize("viewer", "admin", "superadmin"), getOrdersByProduct);
router.get("/by-date", protect, authorize("viewer", "admin", "superadmin"), getOrdersByDate);
router.get("/top-customers", protect, authorize("viewer", "admin", "superadmin"), getTopCustomers);
router.get("/all-orders", protect, authorize("viewer", "admin", "superadmin"), getAllOrders);

export default router;