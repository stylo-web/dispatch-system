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
    join_date: { type: Date, default: Date.now }

}, { timestamps: true });

export default mongoose.model("Company", companySchema);
