import express from "express";
import protect from "../../middleware/authMiddleware.js";
import authorize from "../../middleware/authorize.js";

import {
  getCustomerDashboard,
  getTopCustomers,
  getCustomerSegments,
  getCustomerGrowth,
  getAllCustomers,
  getCustomersByRegion
} from "./customer.Controller.js";
const router = express.Router();
router.get("/dashboard",protect,authorize("viewer", "admin", "superadmin"),getCustomerDashboard);
router.get("/top-customers",protect,authorize("viewer", "admin", "superadmin"),getTopCustomers);
router.get("/segments",protect,authorize("viewer", "admin", "superadmin"),getCustomerSegments);
router.get("/growth",protect,authorize("viewer", "admin", "superadmin"),getCustomerGrowth);
router.get("/all-customers",protect,authorize("viewer", "admin", "superadmin"),getAllCustomers);
router.get("/by-region",protect,authorize("viewer","admin","superadmin"),getCustomersByRegion);

export default router;