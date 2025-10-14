
import User from "../models/admin.model.js";
import { createLog } from "../services/logs.service.js";



export const createSuperAdmin = async (req, res) => {
    try {
        const { name, email, phone, role, permission_level, parent_id, designation } = req.body;

        const profile_image = req.file ? `/public/uploads/${req.file.filename}` : null;


        if (!name || !email || !phone || !role || !permission_level) {
            return res.status(400).json({
                success: false,
                message: "Name, email, phone, role, and permission_level are required"
            });
        }
        const newUserData = {
            name,
            email,
            phone,
            role,
            permission_level,
            profile_image,
            designation,
            parent_id: parent_id || null
        };

        const user = await User.create(newUserData);

        await createLog({
            user_id: req.user?._id || user._id,   // who performed
            company_id: req.user?.company_id || null,
            role: req.user?.role || "super_admin",
            action: "CREATE_SUPER_ADMIN",
            target_collection: "User",
            target_id: user._id,                  // newly created user
            metadata: { email, phone }
        });


        return res.status(201).json({
            success: true,
            message: `${role} created successfully`,
            data: user
        });

    } catch (error) {
        console.error("Error creating super admin:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create super admin",
            error: error.message
        });
    }
};




export const updateSuperAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, role, permission_level, parent_id, designation } = req.body;
        const updateData = { name, email, phone, role, permission_level, designation };

        if (req.file) {
            updateData.profile_image = `/public/uploads/${req.file.filename}`;
        }


        if (parent_id !== undefined) {
            updateData.parent_id = parent_id;

        }
        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "Super admin not found"
            });
        }
        await createLog({
            user_id: req.user?._id || null,
            company_id: req.user?.company_id || null,
            role: req.user?.role || "super_admin",
            action: "UPDATE_SUPER_ADMIN",
            target_collection: "User",
            target_id: updatedUser._id,
            metadata: { email, phone },
        });
        return res.status(200).json({
            success: true,
            message: "Super admin updated successfully",
            data: updatedUser
        });
    }
    catch (error) {
        console.error("Error updating super admin:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update super admin",
            error: error.message
        });
    }
};




export const getAllSuperAdmins = async (req, res) => {
    try {
        const superAdmins = await User.find({ role: "super_admin" })
            .select("-__v -updatedAt"); // exclude unnecessary fields if you want

        return res.status(200).json({
            success: true,
            count: superAdmins.length,
            data: superAdmins
        });
    } catch (error) {
        console.error("Error fetching super admins:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch super admins",
            error: error.message
        });
    }
};




export const getSingleSuperAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const superAdmin = await User.findById(id).select("-__v -updatedAt");

        if (!superAdmin || superAdmin.role !== "super_admin") {
            return res.status(404).json({
                success: false,
                message: "Super admin not found"
            });
        }
        return res.status(200).json({
            success: true,
            data: superAdmin
        });
    } catch (error) {
        console.error("Error fetching super admin:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch super admin",
            error: error.message
        });
    }
};