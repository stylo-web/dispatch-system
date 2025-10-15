import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
    company_name: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true},
    phone: { type: String, required: true, unique: true },
    profile_image: { type: String },
    designation: { type: String },
    gst_number: { type: String },
    address: { type: String },
    narration: { type: String },
    admins: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    user_permission: { type: Number },
    service_start_date: { type: Date, default: Date.now },
    service_end_date: { type: Date, required: true }, // e.g., valid till 2025-12-31
    is_active: { type: Boolean, default: true }, // can be auto-set to false after expiry

}, { timestamps: true });

export default mongoose.model("Company", companySchema);
