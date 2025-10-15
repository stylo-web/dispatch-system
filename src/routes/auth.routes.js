import express from "express";
import { loginWithOtp, verifyOtp, logout } from "../controller/auth.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login-otp", loginWithOtp);
router.post("/verify-otp", verifyOtp);
router.post("/logout", protect, logout);

export default router;
