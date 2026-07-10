import express from "express";

import protect from "../../middleware/authMiddleware.js";
import authorize from "../../middleware/authorize.js";

import {
  getRegionalDashboard,
  getRevenueByRegion,
  getOrdersByRegion,
  getQuantityByRegion,
  getRegionalTable,
} from "./regional.Controller.js";


const router = express.Router();

router.get("/dashboard", protect, authorize("viewer", "admin", "superadmin"), getRegionalDashboard);
router.get("/revenue", protect, authorize("viewer", "admin", "superadmin"), getRevenueByRegion);
router.get("/orders", protect, authorize("viewer", "admin", "superadmin"), getOrdersByRegion);
router.get("/quantity", protect, authorize("viewer", "admin", "superadmin"), getQuantityByRegion);
router.get("/table", protect, getRegionalTable);

export default router;