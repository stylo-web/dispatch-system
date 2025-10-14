import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    company_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin"
    },
    role: { type: String, enum: ["super_admin", "admin", "user"], required: true },
    action: { type: String, required: true },
    target_collection: { type: String },
    target_id: { type: mongoose.Schema.Types.ObjectId },
    metadata: { type: Object },

}, { timestamps: true });

export default mongoose.model("Log", logSchema);
