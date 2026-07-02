import express from "express";

import protect from "../../middleware/authMiddleware.js";

import {
  getRegionalDashboard,
  getRevenueByRegion,
  getOrdersByRegion,
  getQuantityByRegion,
  getRegionalTable,
} from "./regionalController.js";

const router = express.Router();

router.get("/dashboard", protect, getRegionalDashboard);

router.get("/revenue", protect, getRevenueByRegion);

router.get("/orders", protect, getOrdersByRegion);

router.get("/quantity", protect, getQuantityByRegion);

router.get("/table", protect, getRegionalTable);

export default router;