import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  googleAuth,
} from "./auth.Controller.js";

const router = express.Router();

router.get("/me", getMe);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/refresh", refreshAccessToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/google", googleAuth);

export default router;