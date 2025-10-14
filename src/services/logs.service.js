import Log from "../models/logs.model.js";

export const createLog = async (data) => {
    try {
        const log = new Log({
            user_id: data.user_id,
            company_id: data.company_id || null,
            role: data.role,
            action: data.action,
            target_collection: data.target_collection || null,
            target_id: data.target_id || null,
            metadata: data.metadata || {},
        });

        await log.save();
        console.log(" Log saved:", log._id);
        return log;
    } catch (error) {
        console.error(" Error saving log:", error.message);
    }
};
