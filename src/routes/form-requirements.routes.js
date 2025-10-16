import express from "express";
import {
    createFormRequirement,
    getFormRequirement,
    updateFormRequirement
} from "../controller/formRequirement.controller.js";
import { protect } from "../middleware/authMiddleware.js";
import { isAdminOrSuperAdmin } from "../middleware/isAdminOrSuperAdmin.js";

const router = express.Router();

router.post("/", protect, isAdminOrSuperAdmin, createFormRequirement); // Create or set form requirements for a company
router.put("/:id", protect, isAdminOrSuperAdmin, updateFormRequirement); // Update form requirements by ID
router.get("/:company_id", protect, isAdminOrSuperAdmin, getFormRequirement); // Get form requirements by company ID

export default router;