import express from "express";
import { updateUserRole } from "./userController.js";
import protect from "../../middleware/authMiddleware.js";
import authorize from "../../middleware/authorize.js";
const router = express.Router();

router.patch(
  "/:id/role",
  protect,
  authorize("superadmin"),
  updateUserRole
);

export default router;