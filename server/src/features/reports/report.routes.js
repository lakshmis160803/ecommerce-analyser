import express from "express";
import protect from "../../middleware/authMiddleware.js";
import authorize from "../../middleware/authorize.js";

import {
  getReport,
  exportCSV,
  exportExcel,
  downloadInsights,
} from "./report.controller.js";

const router = express.Router();

router.get(
  "/",
  protect,
  authorize("viewer", "admin", "superadmin"),
  getReport
);

router.get(
  "/export/csv",
  protect,
  authorize("viewer", "admin", "superadmin"),
  exportCSV
);

router.get(
  "/export/excel",
  protect,
  authorize("viewer", "admin", "superadmin"),
  exportExcel
);

router.get(
  "/insights",
  protect,
  authorize("viewer", "admin", "superadmin"),
  downloadInsights
);

export default router;