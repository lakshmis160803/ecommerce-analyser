import express from "express";

import {
  uploadOrders,
  getOrderStats,
  getOrdersByStatus,
  getOrdersByProduct,
  getOrdersByDate,
  getTopCustomers,
} from "./orderController.js";

const router = express.Router();

// Upload Orders CSV/Excel Data
router.post(
  "/upload",
  uploadOrders
);

// KPI Cards
router.get(
  "/stats",
  getOrderStats
);

// Pie Chart
router.get(
  "/status",
  getOrdersByStatus
);

// Top Products Bar Chart
router.get(
  "/by-product",
  getOrdersByProduct
);

// Orders Trend Line Chart
router.get(
  "/by-date",
  getOrdersByDate
);

// Top Customers
router.get(
  "/top-customers",
  getTopCustomers
);

export default router;