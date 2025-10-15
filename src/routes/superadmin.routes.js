import express from "express";
import upload from "../utils/upload.js";
import {
    createSuperAdmin,
    getAllSuperAdmins,
    getSingleSuperAdmin,
    updateSuperAdmin
} from "../controller/superadmin.controller.js";
import { protect } from "../middleware/authMiddleware.js";
import { isSuperAdmin } from "../middleware/isSuperAdmin.js";

const router = express.Router();

router.post("/create", upload.single("profile_image"), createSuperAdmin);
router.get("/", protect, getAllSuperAdmins);
router.get("/:id", protect, getSingleSuperAdmin);
router.put("/:id", protect, isSuperAdmin, upload.single("profile_image"), updateSuperAdmin);

export default router;
