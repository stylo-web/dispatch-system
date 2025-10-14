import User from "../models/admin.model.js";
import Otp from "../models/otp.model.js";
import jwt from "jsonwebtoken";
import axios from "axios";
import { createLog } from "../services/logs.service.js";




const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();


const sendSms = async (phone, otp) => {
    console.log(`OTP for ${phone}: ${otp}`);

    try {
        const response = await axios.post(
            "https://www.fast2sms.com/dev/bulkV2",
            {
                route: "v3",
                sender_id: "TXTIND",
                message: `Your OTP is ${otp}`,
                language: "english",
                numbers: phone
            },
            {
                headers: {
                    authorization: process.env.FAST2SMS_API_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("Message sent successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error sending message:", error.response?.data || error.message);
        return { success: false, error: error.response?.data || error.message };
    }
};




export const loginWithOtp = async (req, res) => {
    try {
        const { phone } = req.body;

        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }


        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await Otp.findOneAndUpdate(
            { phone },
            { otp, expiresAt },
            { upsert: true, new: true }
        );

        // send SMS
        sendSms(phone, otp);

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            phone
        });
    } catch (error) {
        console.error("Error in loginWithOtp:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};




export const verifyOtp = async (req, res) => {
    try {
        const { phone, otp } = req.body;

        const otpRecord = await Otp.findOne({ phone });
        if (!otpRecord) {
            return res.status(400).json({ success: false, message: "OTP not found" });
        }

        if (otpRecord.expiresAt < new Date()) {
            return res.status(400).json({ success: false, message: "OTP expired" });
        }

        if (otpRecord.otp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        await Otp.deleteOne({ phone });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" ? true : false,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        await createLog({
            user_id: user._id,
            company_id: user.company_id || null,
            role: user.role,
            action: "LOGIN",
            target_collection: "User",
            target_id: user._id,
            metadata: { phone },

        })

        return res.status(200).json({
            success: true,
            message: "Logged in successfully",
            token,
            user
        });
    } catch (error) {
        console.error("Error in verifyOtp:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};



export const logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production" ? true : false,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    return res.status(200).json({ success: true, message: "Logged out successfully" });
}