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

router.post("/:companyId", protect, isAdminOrSuperAdmin, createAdminUnderCompany); // Create admin under a company
router.put("/:adminId", protect, isAdminOrSuperAdmin, updateAdmin); // Update admin details
router.delete("/:adminId", protect, isAdminOrSuperAdmin, deleteAdmin); // Delete an admin
router.get("/:adminId", protect, isAdminOrSuperAdmin, getSingleAdmin); // Get single admin details
router.get("/company/:companyId", protect, isAdminOrSuperAdmin, getAllAdminsByCompany); // Get all admins under a company

export default router;
