import express from "express";
import {
    createFormRequirement,
    getFormRequirement,
    updateFormRequirement
} from "../controller/formRequirement.controller.js";
import { protect } from "../middleware/authMiddleware.js";
import { isAdminOrSuperAdmin } from "../middleware/isAdminOrSuperAdmin.js";

const router = express.Router();

router.post("/", protect, isAdminOrSuperAdmin, createFormRequirement);
router.put("/:id", protect, isAdminOrSuperAdmin, updateFormRequirement);
router.get("/:company_id", protect, isAdminOrSuperAdmin, getFormRequirement);

export default router;