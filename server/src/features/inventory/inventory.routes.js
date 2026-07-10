import express from "express";
import protect from "../../middleware/authMiddleware.js";
import authorize from "../../middleware/authorize.js";

import {
  getInventoryDashboard,
} from "./inventory.Controller.js";

const router = express.Router();

router.get(
  "/dashboard",
  protect,
  authorize(
    "viewer",
    "admin",
    "superadmin"
  ),
  getInventoryDashboard
);

export default router;