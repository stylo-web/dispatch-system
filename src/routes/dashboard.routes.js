import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { isSuperAdmin } from "../middleware/isSuperAdmin.js";
import { getDashboardStats, getRecentLogs, getExpiringCompanies } from "../controller/dashboard.controller.js";

const router = express.Router();

router.get("/stats", protect, isSuperAdmin, getDashboardStats);
router.get("/recent-logs", protect, isSuperAdmin, getRecentLogs);
router.get("/expiring-companies", protect, isSuperAdmin, getExpiringCompanies);

export default router;
