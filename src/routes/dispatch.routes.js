import express from "express";
import upload from "../utils/upload.js";
import {
    createDispatch,
    deleteDispatch,
    getAllDispatches,
    getDispatchById,
    getDispatches,
    updateDispatch
} from "../controller/dispatch.controller.js";
import { protect } from "../middleware/authMiddleware.js";
import { isAdminOrSuperAdmin } from "../middleware/isAdminOrSuperAdmin.js";
import { checkCompanyStatus } from "../middleware/checkCompanyStatus.js";

const router = express.Router();

const uploadFields = upload.fields([
    { name: "empty_vehicle_photos" },
    { name: "dispatch_product_photos" },
    { name: "loading_person_photo" },
    { name: "driver_photo" },
    { name: "driver_loaded_vehicle_photos" },
    { name: "lr_copy" },
    { name: "dispatch_copy" },
    { name: "eway_bill_copy" },
    { name: "invoice" },
    { name: "packing_details" },
    { name: "extra_1" },
    { name: "extra_2" },
    { name: "pallet_photos" },
    { name: "door_photo" },
    { name: "seal_photo" },
    { name: "fumigation_photos" }
]);

router.post("/create", protect, isAdminOrSuperAdmin, checkCompanyStatus, uploadFields, createDispatch); // Create a new dispatch
router.get("/:id", protect, isAdminOrSuperAdmin, checkCompanyStatus, getDispatchById);   // Get dispatch by ID
router.get("/", protect, isAdminOrSuperAdmin, checkCompanyStatus, getAllDispatches); // Get all dispatches
router.put("/:id", protect, isAdminOrSuperAdmin, checkCompanyStatus, uploadFields, updateDispatch); // Update a dispatch
router.delete("/:id", protect, isAdminOrSuperAdmin, checkCompanyStatus, deleteDispatch); // Delete a dispatch

export default router;
