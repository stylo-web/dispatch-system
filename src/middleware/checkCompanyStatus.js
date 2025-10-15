// middlewares/checkCompanyStatus.js
import Company from "../models/company.model.js";

export const checkCompanyStatus = async (req, res, next) => {
    try {
        const companyId = req.user?.company_id;
        if (!companyId) return next(); // For super admin or public routes

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }

        const now = new Date();
        const expired = now > new Date(company.service_end_date);

        if (expired) {
            company.is_active = false;
            await company.save();

            return res.status(403).json({
                success: false,
                message: "Your company’s subscription has expired. Please renew to continue using the service.",
                expired: true,
            });
        }

        next();
    } catch (error) {
        console.error("Company check failed:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
