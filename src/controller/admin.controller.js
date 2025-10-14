import Company from "../models/company.model.js";
import User from "../models/admin.model.js";
import { createLog } from "../services/logs.service.js";



// CREATE ADMIN UNDER COMPANY
export const createAdminUnderCompany = async (req, res) => {
    try {
        const { companyId } = req.params;
        const { name, email, phone, profile_image, designation, permission_level, role } = req.body;


        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }

        const adminUser = await User.create({
            name,
            email,
            phone,
            profile_image: profile_image || null,
            designation,
            role,
            permission_level,
            company_id: company._id,
            parent_id: req.user._id,
        });

        company.admins.push(adminUser._id);
        await company.save();


        await createLog({
            user_id: req.user._id,
            company_id: company._id,
            role: req.user.role,
            action: "CREATE_ADMIN",
            target_collection: "User",
            target_id: adminUser._id,
            metadata: { email, phone, created_by: req.user._id }
        });

        return res.status(201).json({
            success: true,
            message: "Admin created successfully under company",
            data: { company, newAdmin: adminUser }
        });

    } catch (error) {
        console.error("Error creating admin:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create admin",
            error: error.message
        });
    }
};




// UPDATE ADMIN DETAILS
export const updateAdmin = async (req, res) => {
    try {
        const { adminId } = req.params;
        const updates = req.body;

        const admin = await User.findById(adminId);
        if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });

        const allowedFields = ["name", "email", "phone", "profile_image", "designation", "permission_level", "role"];
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) admin[field] = updates[field];
        });

        await admin.save();

        await createLog({
            user_id: req.user._id,
            company_id: admin.company_id,
            role: req.user.role,
            action: "UPDATE_ADMIN",
            target_collection: "User",
            target_id: admin._id,
            metadata: { updated_fields: Object.keys(updates) }
        });

        res.status(200).json({ success: true, message: "Admin updated successfully", data: admin });
    } catch (error) {
        console.error("Error updating admin:", error);
        res.status(500).json({ success: false, message: "Failed to update admin", error: error.message });
    }
};




// DELETE ADMIN
export const deleteAdmin = async (req, res) => {
    try {
        const { adminId } = req.params;

        const admin = await User.findById(adminId);
        if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });


        // Remove admin from company array
        await Company.findByIdAndUpdate(admin.company_id, { $pull: { admins: admin._id } });

        await admin.deleteOne();

        await createLog({
            user_id: req.user._id,
            company_id: admin.company_id,
            role: req.user.role,
            action: "DELETE_ADMIN",
            target_collection: "User",
            target_id: admin._id,
            metadata: { deleted_admin: admin.email }
        });

        res.status(200).json({ success: true, message: "Admin deleted successfully" });
    } catch (error) {
        console.error("Error deleting admin:", error);
        res.status(500).json({ success: false, message: "Failed to delete admin", error: error.message });
    }
};





// GET SINGLE ADMIN
export const getSingleAdmin = async (req, res) => {
    try {
        const { adminId } = req.params;

        const admin = await User.findById(adminId).populate("company_id", "name email phone");
        if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });

        res.status(200).json({ success: true, data: admin });
    } catch (error) {
        console.error("Error fetching admin:", error);
        res.status(500).json({ success: false, message: "Failed to get admin", error: error.message });
    }
};






//   GET ALL ADMINS UNDER COMPANY

export const getAllAdminsByCompany = async (req, res) => {
    try {
        const { companyId } = req.params;

        const company = await Company.findById(companyId).populate("admins");
        if (!company) return res.status(404).json({ success: false, message: "Company not found" });

        res.status(200).json({ success: true, data: company.admins });
    } catch (error) {
        console.error("Error fetching admins:", error);
        res.status(500).json({ success: false, message: "Failed to fetch admins", error: error.message });
    }
};
