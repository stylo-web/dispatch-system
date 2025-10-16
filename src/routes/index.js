import express from "express";
import authRoutes from "./auth.routes.js";
import superadminRoutes from "./superadmin.routes.js";
import companyRoutes from "./company.routes.js";
import adminRoutes from "./admin.routes.js";
import formRoutes from "./form-requirements.routes.js";
import dispatchRoutes from "./dispatch.routes.js";

const router = express.Router();

router.use("/auth", authRoutes); // Authentication routes
router.use("/super-admin", superadminRoutes); // Super Admin routes
router.use("/company", companyRoutes); // Company routes  
router.use("/admin", adminRoutes); // Admin routes
router.use("/form-requirements", formRoutes);  // Form Requirement routes
router.use("/dispatch", dispatchRoutes);    // Dispatch routes

export default router;