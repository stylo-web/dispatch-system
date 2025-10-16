import express from "express";
import upload from "../utils/upload.js";
import {
    createCompany,
    deleteCompany,
    getCompanyById,
    renewCompanyService,
    updateCompany
} from "../controller/company.controller.js";
import { protect } from "../middleware/authMiddleware.js";
import { isSuperAdmin } from "../middleware/isSuperAdmin.js";
import { isAdminOrSuperAdmin } from "../middleware/isAdminOrSuperAdmin.js";

const router = express.Router();

router.post("/create", protect, isSuperAdmin, upload.single("profile_image"), createCompany); // Create a new company
router.get("/:id", protect, isAdminOrSuperAdmin, getCompanyById); // Get company details by ID 
router.put("/:id", protect, isAdminOrSuperAdmin, upload.single("profile_image"), updateCompany); // Update company details
router.delete("/:id", protect, isSuperAdmin, deleteCompany); // Delete a company
router.put("/:id/renew", protect, isSuperAdmin, renewCompanyService); // Renew company service

export default router;
