import express from "express";
import { loginWithOtp, verifyOtp, logout } from "../controller/auth.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login-otp", loginWithOtp); // Initiate login with OTP
router.post("/verify-otp", verifyOtp); // Verify OTP and login
router.post("/logout", protect, logout); // Logout user

export default router;
