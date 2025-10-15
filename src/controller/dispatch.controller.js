import Dispatch from "../models/dispatch.model.js";
import { createLog } from "../services/logs.service.js";
import { deleteFilesRecursive } from "../utils/fileDeletion.js";
import { convertPdfToJpg } from "../utils/pdfToJpg.js";




export const createDispatch = async (req, res) => {
    try {
        const { company_id, dispatch_type, vehicle_number, note } = req.body;
        const formattedDate = new Date().toISOString().split("T")[0];


        const validateNumberPlate = (num) => /^[A-Z]{2}-\d{2}-[A-Z]{1,2}-\d{1,4}$/i.test(num);
        if (!validateNumberPlate(vehicle_number)) {
            return res.status(400).json({
                success: false,
                message: "Invalid vehicle number format. Expected: XX-00-XX-0000",
            });
        }


        const singleFile = (field) =>
            req.files?.[field]?.[0]
                ? `/uploads/dispatch/${req.files[field][0].filename}`
                : null;

        const multipleFiles = (field) =>
            req.files?.[field]
                ? req.files[field].map((f) => `/uploads/dispatch/${f.filename}`)
                : [];


        const finalData = {
            dispatch_type,
            vehicle_number,
            date: formattedDate,
            note,
            company_id,
            created_by: req.user._id,

            empty_vehicle_photos: multipleFiles("empty_vehicle_photos"),
            dispatch_product_photos: multipleFiles("dispatch_product_photos"),

            loading_person: {
                name: req.body.loading_person_name,
                phone: req.body.loading_person_phone,
                loading_person_photo: singleFile("loading_person_photo"),
            },

            driver_details: {
                name: req.body.driver_name,
                phone: req.body.driver_phone,
                driver_photo: singleFile("driver_photo"),
                loaded_vehicle_photos: multipleFiles("driver_loaded_vehicle_photos"),
            },

            billing_details: {
                lr_copy: singleFile("lr_copy"),
                dispatch_copy: singleFile("dispatch_copy"),
                eway_bill_copy: singleFile("eway_bill_copy"),
                invoice: singleFile("invoice"),
                packing_details: singleFile("packing_details"),
                extra_1: singleFile("extra_1"),
                extra_2: singleFile("extra_2"),
            },

            container_details: {
                pallet_photos: multipleFiles("pallet_photos"),
                door_photo: singleFile("door_photo"),
                seal_photo: singleFile("seal_photo"),
                fumigation_photos: multipleFiles("fumigation_photos"),
            },
        };




        for (const key in finalData.billing_details) {
            const filePath = finalData.billing_details[key];
            if (filePath && filePath.endsWith(".pdf")) {
                finalData.billing_details[key] = await convertPdfToJpg(filePath);
            }
        }

        const dispatch = await Dispatch.create(finalData);

        await createLog({
            user_id: req.user?._id || null,
            company_id: req.user?.company_id || null,
            role: req.user?.role || "super_admin",
            action: "CREATE_DISPATCH",
            target_collection: "Dispatch",
            target_id: dispatch._id,
            metadata: { vehicle_number, date: formattedDate, dispatch_type },
        });

        res.status(201).json({
            success: true,
            message: "Dispatch created successfully",
            data: dispatch,
        });
    } catch (error) {
        console.error("Error creating dispatch:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create dispatch",
            error: error.message,
        });
    }
};




export const getDispatches = async (req, res) => {
    try {
        const { company_id } = req.query;
        const filter = company_id ? { company_id } : {};
        const dispatches = await Dispatch.find(filter)
            .populate("created_by", "name email phone role designation profile_image permission_level")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: dispatches
        });
    }
    catch (error) {
        console.error("Error fetching dispatches:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};

export const getDispatchById = async (req, res) => {
    try {
        const { id } = req.params;
        const dispatch = await Dispatch.findById(id)
            .populate("created_by", "name email phone role designation profile_image permission_level")

        if (!dispatch) {
            return res.status(404).json({
                success: false,
                message: "Dispatch not found"
            });
        }
        res.status(200).json({
            success: true,
            data: dispatch
        });
    }
    catch (error) {
        console.error("Error fetching dispatch by ID:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};




export const deleteDispatch = async (req, res) => {
    try {
        const { id } = req.params;
        const dispatch = await Dispatch.findById(id);

        if (!dispatch) {
            return res.status(404).json({
                success: false,
                message: "Dispatch not found",
            });
        }


        console.log("Deleting related files...");
        deleteFilesRecursive(dispatch.toObject());


        await Dispatch.findByIdAndDelete(id);


        await createLog({
            user_id: req.user?._id || null,
            company_id: req.user?.company_id || null,
            role: req.user?.role || "super_admin",
            action: "DELETE_DISPATCH",
            target_collection: "Dispatch",
            target_id: dispatch._id,
            metadata: {
                vehicle_number: dispatch.vehicle_number,
                date: dispatch.date,
                dispatch_type: dispatch.dispatch_type,
            },
        });


        res.status(200).json({
            success: true,
            message: "Dispatch and all related files deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting dispatch:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete dispatch",
            error: error.message,
        });
    }
};



// Update Dispatch
export const updateDispatch = async (req, res) => {
    try {
        const { id } = req.params;
        const { company_id, dispatch_type, vehicle_number, note } = req.body;


        const validateNumberPlate = (num) => /^[A-Z]{2}-\d{2}-[A-Z]{1,2}-\d{1,4}$/i.test(num);
        if (!validateNumberPlate(vehicle_number)) {
            return res.status(400).json({
                success: false,
                message: "Invalid vehicle number format. Expected: XX-00-XX-0000",
            });
        }


        const existingDispatch = await Dispatch.findById(id);
        if (!existingDispatch) {
            return res.status(404).json({
                success: false,
                message: "Dispatch not found",
            });
        }

        const singleFile = (field) =>
            req.files?.[field]?.[0]
                ? `/uploads/dispatch/${req.files[field][0].filename}`
                : existingDispatch?.[field] || null;

        const multipleFiles = (field, existingFiles = []) =>
            req.files?.[field]
                ? [
                    ...existingFiles,
                    ...req.files[field].map((f) => `/uploads/dispatch/${f.filename}`),
                ]
                : existingFiles;


        const updatedData = {
            dispatch_type: dispatch_type || existingDispatch.dispatch_type,
            vehicle_number: vehicle_number || existingDispatch.vehicle_number,
            note: note || existingDispatch.note,
            company_id: company_id || existingDispatch.company_id,
            updated_by: req.user._id,

            empty_vehicle_photos: multipleFiles(
                "empty_vehicle_photos",
                existingDispatch.empty_vehicle_photos || []
            ),
            dispatch_product_photos: multipleFiles(
                "dispatch_product_photos",
                existingDispatch.dispatch_product_photos || []
            ),

            loading_person: {
                name: req.body.loading_person_name || existingDispatch.loading_person?.name,
                phone: req.body.loading_person_phone || existingDispatch.loading_person?.phone,
                loading_person_photo:
                    singleFile("loading_person_photo") ||
                    existingDispatch.loading_person?.loading_person_photo ||
                    null,
            },

            driver_details: {
                name: req.body.driver_name || existingDispatch.driver_details?.name,
                phone: req.body.driver_phone || existingDispatch.driver_details?.phone,
                driver_photo:
                    singleFile("driver_photo") ||
                    existingDispatch.driver_details?.driver_photo ||
                    null,
                loaded_vehicle_photos: multipleFiles(
                    "driver_loaded_vehicle_photos",
                    existingDispatch.driver_details?.loaded_vehicle_photos || []
                ),
            },

            billing_details: {
                lr_copy:
                    singleFile("lr_copy") ||
                    existingDispatch.billing_details?.lr_copy ||
                    null,
                dispatch_copy:
                    singleFile("dispatch_copy") ||
                    existingDispatch.billing_details?.dispatch_copy ||
                    null,
                eway_bill_copy:
                    singleFile("eway_bill_copy") ||
                    existingDispatch.billing_details?.eway_bill_copy ||
                    null,
                invoice:
                    singleFile("invoice") ||
                    existingDispatch.billing_details?.invoice ||
                    null,
                packing_details:
                    singleFile("packing_details") ||
                    existingDispatch.billing_details?.packing_details ||
                    null,
                extra_1:
                    singleFile("extra_1") ||
                    existingDispatch.billing_details?.extra_1 ||
                    null,
                extra_2:
                    singleFile("extra_2") ||
                    existingDispatch.billing_details?.extra_2 ||
                    null,
            },

            container_details: {
                pallet_photos: multipleFiles(
                    "pallet_photos",
                    existingDispatch.container_details?.pallet_photos || []
                ),
                door_photo:
                    singleFile("door_photo") ||
                    existingDispatch.container_details?.door_photo ||
                    null,
                seal_photo:
                    singleFile("seal_photo") ||
                    existingDispatch.container_details?.seal_photo ||
                    null,
                fumigation_photos: multipleFiles(
                    "fumigation_photos",
                    existingDispatch.container_details?.fumigation_photos || []
                ),
            },
        };


        for (const key in updatedData.billing_details) {
            const filePath = updatedData.billing_details[key];
            if (filePath && filePath.endsWith(".pdf")) {
                updatedData.billing_details[key] = await convertPdfToJpg(filePath);
            }
        }


        const updatedDispatch = await Dispatch.findByIdAndUpdate(id, updatedData, {
            new: true,
        });


        await createLog({
            user_id: req.user?._id || null,
            company_id: req.user?.company_id || null,
            role: req.user?.role || "super_admin",
            action: "UPDATE_DISPATCH",
            target_collection: "Dispatch",
            target_id: updatedDispatch._id,
            metadata: {
                vehicle_number: updatedDispatch.vehicle_number,
                dispatch_type: updatedDispatch.dispatch_type,
            },
        });


        res.status(200).json({
            success: true,
            message: "Dispatch updated successfully",
            data: updatedDispatch,
        });
    } catch (error) {
        console.error("Error updating dispatch:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update dispatch",
            error: error.message,
        });
    }
};