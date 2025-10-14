import express from "express";
import { createSuperAdmin, getAllSuperAdmins, getSingleSuperAdmin, updateSuperAdmin } from "../controller/superadmin.controller.js";
import { loginWithOtp, logout, verifyOtp } from "../controller/auth.controller.js";
import { protect } from "../middleware/authMiddleware.js";
import { createCompany, deleteCompany, getCompanyById, updateCompany } from "../controller/company.controller.js";
import { isSuperAdmin } from "../middleware/isSuperAdmin.js";
import { isAdmin } from "../middleware/isAdmin.js";
import { createAdminUnderCompany, deleteAdmin, getAllAdminsByCompany, getSingleAdmin, updateAdmin } from "../controller/admin.controller.js";
import { createFormRequirement, getFormRequirement, updateFormRequirement } from "../controller/formRequirement.controller.js";
import upload from "../utils/upload.js";
import { createDispatch, deleteDispatch, getDispatchById, getDispatches, updateDispatch } from "../controller/dispatch.controller.js";


const router = express.Router();


// super admin routes
router.post("/super-admin-create", upload.single("profile_image"), createSuperAdmin); // Public route to create the first super admin
router.get("/all-super-admins", protect, getAllSuperAdmins); // Protected route to get all super admins
router.get("/super-admin/:id", protect, getSingleSuperAdmin); // Protected route to get a single super admin by ID
router.put("/super-admin/:id", protect, isSuperAdmin, upload.single("profile_image"), updateSuperAdmin); // Only super admins can update other super admins


// auth routes
router.post("/login-otp", loginWithOtp); // Public route to request OTP
router.post("/verify-otp", verifyOtp); // Public route to verify OTP and login
router.post("/logout", protect, logout); // Protected route to logout user

// company routes
router.post("/company-create", protect, isSuperAdmin, upload.single("profile_image"), createCompany); // Only super admins can create companies
router.get("/company/:id", protect, isAdmin, getCompanyById); // Admins and super admins can get company details
router.put("/company/:id", protect, isAdmin, upload.single("profile_image"), updateCompany); // Super admins & Admins can update companies
router.delete("/company/:id", protect, isSuperAdmin, deleteCompany); // Super admins & Admins can delete companies


// admin routes
router.post("/:companyId/admins", protect, isAdmin, createAdminUnderCompany); // Create admin under a company
router.put("/admin/:adminId", protect, isAdmin, updateAdmin); // Update admin details
router.delete("/admin/:adminId", protect, isAdmin, deleteAdmin); // Delete an admin
router.get("/admin/:adminId", protect, isAdmin, getSingleAdmin); // Get single admin details
router.get("/:companyId/admins", protect, isAdmin, getAllAdminsByCompany); // Get all admins under a company


// form requirement routes
router.post("/form-requirements", protect, isAdmin, createFormRequirement); // Get all admins under a company
router.put("/form-requirements/:id", protect, isAdmin, updateFormRequirement); // Update form requirement
router.get("/form-requirements/:company_id", protect, isAdmin, getFormRequirement); // Get form requirement by company and dispatch type


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

router.post("/dispatch", protect, isAdmin, uploadFields, createDispatch); // Upload dispatch documents and create dispatch
router.get("/dispatch/:id", protect, isAdmin, getDispatchById); // Upload dispatch documents and create dispatch
router.get("/dispatch-all", protect, isAdmin, getDispatches); // Get all dispatches
router.put("/dispatch/:id", protect, isAdmin, uploadFields, updateDispatch); // Update a dispatch
router.delete("/dispatch/:id", protect, isAdmin, deleteDispatch); // Delete a dispatch




export default router;