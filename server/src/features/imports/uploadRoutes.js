import express from "express";
import {
  uploadProducts,
  getUploads,
  getDashboardStats,
} from "./uploadController.js";

import { uploadOrders } from "../orders/orderController.js";

const router = express.Router();

router.get("/uploads", getUploads);
router.get("/dashboard", getDashboardStats);
router.get("/dashboard/:uploadId", getDashboardStats);
router.post("/products", uploadProducts);
router.post("/orders", uploadOrders);


export default router;