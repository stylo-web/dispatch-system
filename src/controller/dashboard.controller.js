import Company from "../models/company.model.js";
import Admin from "../models/admin.model.js";
import Dispatch from "../models/dispatch.model.js";
import Log from "../models/logs.model.js";
import moment from "moment";

// Basic statistics (counts)
export const getDashboardStats = async (req, res) => {
    try {
        const totalCompanies = await Company.countDocuments();
        const activeCompanies = await Company.countDocuments({ is_active: true });
        const expiredCompanies = await Company.countDocuments({ is_active: false });

        const totalAdmins = await Admin.countDocuments();
        const totalDispatches = await Dispatch.countDocuments();

        res.status(200).json({
            success: true,
            data: {
                companies: { total: totalCompanies, active: activeCompanies, expired: expiredCompanies },
                admins: totalAdmins,
                dispatches: totalDispatches,
            },
        });
    } catch (error) {
        console.error("Dashboard stats error:", error);
        res.status(500).json({ success: false, message: "Error fetching dashboard stats" });
    }
};

export const getRecentLogs = async (req, res) => {
    try {
        // Parse query params for pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const skip = (page - 1) * limit;


        const logs = await Log.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("user_id", "name role")
            .populate("company_id", "company_name");

        const total = await Log.countDocuments();

        res.status(200).json({
            success: true,
            message: "Recent logs fetched successfully",
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            totalLogs: total,
            data: logs,
        });

    } catch (error) {
        console.error("Error fetching recent logs:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching recent logs",
            error: error.message // 👈 also send this for debugging
        });
    }
};




// Companies whose service expires soon (within 7 days)
export const getExpiringCompanies = async (req, res) => {
    try {


        const today = moment();
        const nextWeek = moment().add(7, "days");


        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const skip = (page - 1) * limit;
        const total = await Company.countDocuments({
            service_end_date: { $gte: today.toDate(), $lte: nextWeek.toDate() }
        });


        const expiring = await Company.find({
            service_end_date: { $gte: today.toDate(), $lte: nextWeek.toDate() }
        }).skip(skip)
            .limit(limit)
            .select("company_name service_end_date");

        res.status(200).json({
            success: true,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            totalexpiredcompany: total,
            data: expiring
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching expiring companies", error: error.message });
    }
};
