import FormRequirement from "../models/formRequirement.model.js";
import { createLog } from "../services/logs.service.js";

/**
 * CREATE FORM REQUIREMENT
 */
export const createFormRequirement = async (req, res) => {
    try {
        const { company_id, dispatch_type, required_fields } = req.body;

        // Check if configuration already exists for this company and dispatch type
        const existing = await FormRequirement.findOne({ company_id, dispatch_type });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Configuration already exists for this company and dispatch type",
            });
        }

        const newForm = await FormRequirement.create({
            company_id,
            dispatch_type,
            required_fields,
        });

        // Log creation
        await createLog({
            user_id: req.user?._id || null,
            company_id: company_id,
            role: req.user?.role || "system",
            action: "CREATE_FORM_REQUIREMENT",
            target_collection: "FormRequirement",
            target_id: newForm._id,
            metadata: { required_fields },
        });

        res.status(201).json({
            success: true,
            message: "Form requirement created successfully",
            data: newForm,
        });
    } catch (error) {
        console.error("Error creating form requirement:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};

/**
 * UPDATE FORM REQUIREMENT
 */
export const updateFormRequirement = async (req, res) => {
    try {
        const { id } = req.params;
        const { required_fields } = req.body;

        const existing = await FormRequirement.findById(id);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Configuration not found",
            });
        }

        // Deep merge nested objects
        function deepMerge(target, source) {
            for (const key in source) {
                if (typeof source[key] === "object" && !Array.isArray(source[key])) {
                    target[key] = target[key] || {};
                    deepMerge(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
        }

        if (required_fields && typeof required_fields === "object") {
            deepMerge(existing.required_fields, required_fields);
        }

        await existing.save();

        // Log update
        await createLog({
            user_id: req.user?._id || null,
            company_id: existing.company_id,
            role: req.user?.role || "system",
            action: "UPDATE_FORM_REQUIREMENT",
            target_collection: "FormRequirement",
            target_id: id,
            metadata: required_fields,
        });

        res.status(200).json({
            success: true,
            message: "Form requirement updated successfully",
            data: existing,
        });
    } catch (error) {
        console.error("Error updating form requirement:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};

/**
 * GET SINGLE FORM REQUIREMENT (BY COMPANY + TYPE)
 */
export const getFormRequirement = async (req, res) => {
    try {
        const { company_id } = req.params;
        const { dispatch_type } = req.query; // optional filter for domestic/export

        const filter = { company_id };
        if (dispatch_type) filter.dispatch_type = dispatch_type;

        const formRequirement = await FormRequirement.findOne(filter);

        if (!formRequirement) {
            return res.status(404).json({
                success: false,
                message: "Configuration not found",
            });
        }

        res.status(200).json({
            success: true,
            data: formRequirement,
        });
    } catch (error) {
        console.error("Error fetching form requirement:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};

/**
 * GET ALL FORM REQUIREMENTS
 */
export const getAllFormRequirements = async (req, res) => {
    try {
        const requirements = await FormRequirement.find()
            .populate("company_id", "name email") // populate only important fields
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: requirements,
        });
    } catch (error) {
        console.error("Error fetching all form requirements:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};
