import mongoose from "mongoose";

const dispatchSchema = new mongoose.Schema({

    dispatch_type: {
        type: String,
        enum: ["domestic", "export"],
        required: true
    },

    vehicle_number: { type: String, required: true },
    date: { type: Date, required: true },
    empty_vehicle_photos: [{ type: String }],
    dispatch_product_photos: [{ type: String }],

    loading_person: {
        name: { type: String },
        phone: { type: String },
        loading_person_photo: { type: String }
    },

    driver_details: {
        name: { type: String },
        phone: { type: String },
        driver_photo: { type: String },
        loaded_vehicle_photos: [{ type: String }]
    },

    billing_details: {
        lr_copy: { type: String },
        dispatch_copy: { type: String },
        eway_bill_copy: { type: String },
        invoice: { type: String },
        packing_details: { type: String },
        extra_1: { type: String },
        extra_2: { type: String }
    },

    container_details: {
        pallet_photos: [{ type: String }],
        container_door_photo: { type: String },
        seal_photo: { type: String },
        fumigation_photos: [{ type: String }]
    },

    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    company_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company"
    },

    note: { type: String },

}, { timestamps: true });

export default mongoose.model("Dispatch", dispatchSchema);
