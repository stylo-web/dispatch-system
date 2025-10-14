import jwt from "jsonwebtoken";
import User from "../models/admin.model.js";

export const protect = async (req, res, next) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({ success: false, message: "Not authorized, no token" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id).select("-__v -createdAt -updatedAt");

        if (!req.user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error.message);
        return res.status(401).json({ success: false, message: "Not authorized, token failed" });
    }
};

