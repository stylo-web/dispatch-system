import mongoose from "mongoose";

const formRequirementSchema = new mongoose.Schema({
    company_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true
    },

    dispatch_type: {
        type: String,
        enum: ["domestic", "export"],
        required: true
    },

    required_fields: {
        vehicle_number: { type: Boolean, default: true },
        date: { type: Boolean, default: true },
        empty_vehicle_photos: { type: Boolean, default: true },
        dispatch_product_photos: { type: Boolean, default: false },

        loading_person: {
            name: { type: Boolean, default: true },
            phone: { type: Boolean, default: true },
            photo: { type: Boolean, default: true }
        },

        driver_details: {
            name: { type: Boolean, default: true },
            phone: { type: Boolean, default: true },
            photo: { type: Boolean, default: true },
            loaded_vehicle_photos: { type: Boolean, default: true }
        },

        billing_details: {
            lr_copy: { type: Boolean, default: false },
            dispatch_copy: { type: Boolean, default: false },
            eway_bill_copy: { type: Boolean, default: false },
            invoice: { type: Boolean, default: false },
            packing_details: { type: Boolean, default: false },
            extra_1: { type: Boolean, default: false },
            extra_2: { type: Boolean, default: false }
        },

        container_details: {
            pallet_photos: { type: Boolean, default: false },
            container_door_photo: { type: Boolean, default: false },
            seal_photo: { type: Boolean, default: false },
            fumigation_photos: { type: Boolean, default: false }
        },

        note: { type: Boolean, default: false }
    }

}, { timestamps: true });

export default mongoose.model("FormRequirement", formRequirementSchema);
