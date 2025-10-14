export const isSuperAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized: No user found" });
    }

    if (req.user.role !== "super_admin") {
        return res.status(403).json({ success: false, message: "Forbidden: Only super admins can access this route" });
    }

    next();
};
