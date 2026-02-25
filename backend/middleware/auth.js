const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verify JWT and attach user to req
const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        if (!user.isActive) {
            return res.status(401).json({ message: "Account is deactivated" });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token invalid or expired" });
    }
};

// Allow only admins
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        return next();
    }
    return res.status(403).json({ message: "Access denied: Admins only" });
};

// Allow only students
const studentOnly = (req, res, next) => {
    if (req.user && req.user.role === "student") {
        return next();
    }
    return res.status(403).json({ message: "Access denied: Students only" });
};

module.exports = { protect, adminOnly, studentOnly };
