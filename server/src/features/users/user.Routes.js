import express from "express";
import {
  getUsers,
  updateUserRole,
  createAdmin,
} from "./user.Controller.js";
import protect from "../../middleware/authMiddleware.js";
import authorize from "../../middleware/authorize.js";
const router = express.Router();
router.get("/",protect,authorize("superadmin"),getUsers);
router.patch("/:id/role",protect,authorize("superadmin"),updateUserRole);
router.post("/create-admin",protect,authorize("superadmin"),createAdmin);

export default router;