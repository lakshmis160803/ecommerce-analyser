import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
} from "./authController.js";


const router = express.Router();

router.get("/me", getMe);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);


export default router;     