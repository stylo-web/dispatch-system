import Company from "../models/company.model.js";
import User from "../models/admin.model.js";
import { createLog } from "../services/logs.service.js";

export const createCompany = async (req, res) => {
    try {


        const { company_name, name, email, phone, designation, gst_number, address, narration, user_permission } = req.body;

        const profile_image = req.file ? `/public/uploads/${req.file.filename}` : null;
        if (!company_name || !name || !email || !phone) {
            return res.status(400).json({
                success: false,
                message: "company_name, name, email, and phone are required"
            });
        }


        const existing = await Company.findOne({ $or: [{ email }, { phone }] });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Company with this email or phone already exists"
            });
        }


        const company = new Company({
            company_name,
            name,
            email,
            phone,
            profile_image,
            designation,
            gst_number,
            address,
            narration,
            user_permission
        });

        await company.save();

        const adminUser = await User.create({
            name,
            email,
            phone,
            profile_image: profile_image || null,
            designation: designation || "Company Admin",
            role: "admin",
            permission_level: "full",
            company_id: company._id,
            parent_id: req.user._id
        });

        company.admins.addToSet(adminUser._id);
        await company.save();

        // (Optional) Decide if super admin should be updated
        // await User.findByIdAndUpdate(req.user._id, { company_id: company._id });

        await createLog({
            user_id: req.user._id,
            company_id: company._id,
            role: req.user.role,
            action: "CREATE_COMPANY",
            target_collection: "Company",
            target_id: company._id,
            metadata: { company_name: name, first_admin: adminUser._id }
        });

        return res.status(201).json({
            success: true,
            message: "Company created successfully with first admin",
            data: { company, firstAdmin: adminUser }
        });

    } catch (error) {
        console.error("Error creating company:", error.stack);
        return res.status(500).json({
            success: false,
            message: "Failed to create company",
            error: error.message
        });
    }
};






// GET SINGLE COMPANY
export const getCompanyById = async (req, res) => {
    try {

        const { id } = req.params;
        const company = await Company.findById(id).populate("admins", "name email phone role designation profile_image permission_level");

        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }

        return res.status(200).json({
            success: true,
            data: company
        });
    } catch (error) {
        console.error("Error fetching company:", error.stack);
        return res.status(500).json({ success: false, message: "Failed to fetch company", error: error.message });
    }
};






// UPDATE COMPANY
export const updateCompany = async (req, res) => {
    try {

        const { id } = req.params;
        const updates = req.body;

        if (req.file) {
            updates.profile_image = `/public/uploads/${req.file.filename}`;
        }


        const company = await Company.findById(id);
        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }


        const allowedFields = ["company_name", "name", "email", "phone", "profile_image", "designation", "gst_number", "address", "narration", "user_permission"];
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) company[field] = updates[field];
        });


        await company.save();

        if (company.admins && company.admins.length > 0) {
            const firstAdminId = company.admins[0];
            const admin = await User.findById(firstAdminId);

            if (admin) {
                // Allowed fields for admin (sync with company where relevant)
                const adminAllowedFields = ["name", "email", "phone", "profile_image", "designation"];

                adminAllowedFields.forEach(field => {
                    if (updates[field] !== undefined) admin[field] = updates[field];
                });

                await admin.save();
            }
        }


        await createLog({
            user_id: req.user._id,
            company_id: company._id,
            role: req.user.role,
            action: "UPDATE_COMPANY",
            target_collection: "Company",
            target_id: company._id,
            metadata: { updated_fields: Object.keys(updates) }
        });

        return res.status(200).json({
            success: true,
            message: "Company updated successfully",
            data: company
        });

    } catch (error) {
        console.error("Error updating company:", error.stack);
        return res.status(500).json({ success: false, message: "Failed to update company", error: error.message });
    }
};






// DELETE COMPANY
export const deleteCompany = async (req, res) => {
    try {

        const { id } = req.params;
        const company = await Company.findById(id);



        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }



        await User.deleteMany({ company_id: company._id, role: "admin" });
        await company.deleteOne();

        if (company.admins && company.admins.length > 0) {
            const firstAdminId = company.admins[0];
            const admin = await User.findById(firstAdminId);

            if (admin) {
                await User.deleteOne(admin);
            }
        }


        await createLog({
            user_id: req.user._id,
            company_id: id,
            role: req.user.role,
            action: "DELETE_COMPANY",
            target_collection: "Company",
            target_id: id,
            metadata: { company_name: company.name }
        });

        return res.status(200).json({
            success: true,
            message: "Company and its admins deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting company:", error.stack);
        return res.status(500).json({ success: false, message: "Failed to delete company", error: error.message });
    }
};
