import express from "express";
import upload from "../utils/upload.js";
import {
    createDispatch,
    deleteDispatch,
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

router.post("/", protect, isAdminOrSuperAdmin, checkCompanyStatus, uploadFields, createDispatch);
router.get("/:id", protect, isAdminOrSuperAdmin, checkCompanyStatus, getDispatchById);
router.get("/", protect, isAdminOrSuperAdmin, checkCompanyStatus, getDispatches);
router.put("/:id", protect, isAdminOrSuperAdmin, checkCompanyStatus, uploadFields, updateDispatch);
router.delete("/:id", protect, isAdminOrSuperAdmin, checkCompanyStatus, deleteDispatch);

export default router;
