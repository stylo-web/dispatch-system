import Dispatch from "../models/dispatch.model.js";
import { createLog } from "../services/logs.service.js";
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
        const dispatches = await Dispatch.find(filter).populate("created_by", "name email phone role designation profile_image permission_level").sort({ createdAt: -1 });
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
        const dispatch = await Dispatch.findById(id).populate("created_by", "name email phone role designation profile_image permission_level");
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
        const dispatch = await Dispatch.findByIdAndDelete(id);
        if (!dispatch) {
            return res.status(404).json({
                success: false,
                message: "Dispatch not found"
            });
        }

        await createLog({
            user_id: req.user?._id || user._id,   // who performed
            company_id: req.user?.company_id || null,
            role: req.user?.role || "super_admin",
            action: "DELETE_DISPATCH",
            target_collection: "Dispatch",
            target_id: dispatch._id,                  // newly created dispatch
            metadata: { vehicle_number: dispatch.vehicle_number, date: dispatch.date, dispatch_type: dispatch.dispatch_type }
        });

        res.status(200).json({
            success: true,
            message: "Dispatch deleted successfully"
        });
    }
    catch (error) {
        console.error("Error deleting dispatch:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};


export const updateDispatch = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };

        const singleFile = async (field) => {
            if (req.files?.[field]?.[0]) {
                const uploadedPath = `/uploads/dispatch/${req.files[field][0].filename}`;
                return await processFile(`.${uploadedPath}`);
            }
            return undefined;
        };

        const multipleFiles = async (field) => {
            if (req.files?.[field]) {
                const uploadedPaths = req.files[field].map(f => `./uploads/dispatch/${f.filename}`);
                return await processFiles(uploadedPaths);
            }
            return [];
        };

        // 🔁 Process each field dynamically
        const fileMap = {
            "empty_vehicle_photos": "multiple",
            "dispatch_product_photos": "multiple",
            "loading_person_photo": "single",
            "driver_photo": "single",
            "driver_loaded_vehicle_photos": "multiple",
            "lr_copy": "single",
            "dispatch_copy": "single",
            "eway_bill_copy": "single",
            "invoice": "single",
            "packing_details": "single",
            "extra_1": "single",
            "extra_2": "single",
            "pallet_photos": "multiple",
            "door_photo": "single",
            "seal_photo": "single",
            "fumigation_photos": "multiple"
        };

        for (const [key, type] of Object.entries(fileMap)) {
            if (req.files?.[key]) {
                const path = type === "single"
                    ? await singleFile(key)
                    : await multipleFiles(key);

                if (key.startsWith("driver_") || key.startsWith("loading_person") || key.startsWith("billing_details") || key.startsWith("container_details")) {
                    const [parent, child] = key.split(".");
                    updates[parent] = updates[parent] || {};
                    updates[parent][child] = path;
                } else {
                    updates[key] = path;
                }
            }
        }

        const dispatch = await Dispatch.findByIdAndUpdate(id, updates, { new: true });
        if (!dispatch) {
            return res.status(404).json({ success: false, message: "Dispatch not found" });
        }

        res.status(200).json({
            success: true,
            message: "Dispatch updated successfully",
            data: dispatch
        });
    } catch (error) {
        console.error("Error updating dispatch:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};