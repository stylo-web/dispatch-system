import express from "express";
import {
    createAdminUnderCompany,
    deleteAdmin,
    getAllAdminsByCompany,
    getSingleAdmin,
    updateAdmin
} from "../controller/admin.controller.js";
import { protect } from "../middleware/authMiddleware.js";
import { isAdminOrSuperAdmin } from "../middleware/isAdminOrSuperAdmin.js";

const router = express.Router();

router.post("/:companyId", protect, isAdminOrSuperAdmin, createAdminUnderCompany);
router.put("/:adminId", protect, isAdminOrSuperAdmin, updateAdmin);
router.delete("/:adminId", protect, isAdminOrSuperAdmin, deleteAdmin);
router.get("/:adminId", protect, isAdminOrSuperAdmin, getSingleAdmin);
router.get("/company/:companyId", protect, isAdminOrSuperAdmin, getAllAdminsByCompany);

export default router;
