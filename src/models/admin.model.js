import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true},
    phone: { type: String, required: true, unique: true },
    profile_image: { type: String },
    designation: { type: String },
    role: {
        type: String,
        enum: ["super_admin", "admin"],
        required: true,
    },
    permission_level: {
        type: String,
        enum: ["full", "view_only", "edit_only"],
        required: true
    },
    parent_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    }
}, { timestamps: true });



export default mongoose.model("User", userSchema);
