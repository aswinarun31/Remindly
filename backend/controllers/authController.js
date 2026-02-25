const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
};

// @desc   Register with email/password
// @route  POST /api/auth/register
exports.register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ message: "All fields are required" });

        const exists = await User.findOne({ email });
        if (exists)
            return res.status(409).json({ message: "Email already registered" });

        const hashed = await bcrypt.hash(password, 12);
        const userCount = await User.countDocuments();

        const user = await User.create({
            name,
            email,
            password: hashed,
            role: userCount === 0 ? "admin" : "student",
        });

        const token = generateToken(user._id);
        res.status(201).json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc   Login with email/password
// @route  POST /api/auth/login
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: "Email and password are required" });

        const user = await User.findOne({ email });
        if (!user || !user.password)
            return res.status(401).json({ message: "Invalid credentials" });

        const match = await bcrypt.compare(password, user.password);
        if (!match)
            return res.status(401).json({ message: "Invalid credentials" });

        if (!user.isActive)
            return res.status(401).json({ message: "Account is deactivated" });

        const token = generateToken(user._id);
        res.status(200).json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc   Google OAuth callback — issues JWT
// @route  GET /api/auth/google/callback
exports.googleCallback = (req, res) => {
    const user = req.user;
    const token = generateToken(user._id);
    // Redirect to frontend with token in query string
    const frontendURL = process.env.FRONTEND_URL || "http://localhost:8080";
    res.redirect(`${frontendURL}/auth/callback?token=${token}`);
};

// @desc   Get current logged-in user
// @route  GET /api/auth/me
exports.getMe = async (req, res) => {
    const user = req.user;
    res.status(200).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
    });
};

// @desc  Admin promotes/demotes a user's role
// @route PATCH /api/auth/users/:id/role
exports.updateUserRole = async (req, res, next) => {
    try {
        const { role } = req.body;
        if (!["admin", "student"].includes(role))
            return res.status(400).json({ message: "Invalid role" });

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user)
            return res.status(404).json({ message: "User not found" });

        res.status(200).json({ id: user.id, name: user.name, email: user.email, role: user.role });
    } catch (error) {
        next(error);
    }
};

// @desc  Get all users (admin only)
// @route GET /api/auth/users
exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
};
