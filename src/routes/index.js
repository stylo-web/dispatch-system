import express from "express";
import authRoutes from "./auth.routes.js";
import superadminRoutes from "./superadmin.routes.js";
import companyRoutes from "./company.routes.js";
import adminRoutes from "./admin.routes.js";
import formRoutes from "./form.routes.js";
import dispatchRoutes from "./dispatch.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/super-admin", superadminRoutes);
router.use("/company", companyRoutes);
router.use("/admin", adminRoutes);
router.use("/form-requirements", formRoutes);
router.use("/dispatch", dispatchRoutes);

export default router;