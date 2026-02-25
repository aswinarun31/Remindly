const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
    register,
    login,
    googleCallback,
    getMe,
    updateUserRole,
    getAllUsers,
} = require("../controllers/authController");
const { protect, adminOnly } = require("../middleware/auth");

// Email / password auth
router.post("/register", register);
router.post("/login", login);

// Google OAuth
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"], session: false })
);
router.get(
    "/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: "/login?error=google_failed" }),
    googleCallback
);

// Protected routes
router.get("/me", protect, getMe);

// Admin-only
router.get("/users", protect, adminOnly, getAllUsers);
router.patch("/users/:id/role", protect, adminOnly, updateUserRole);

module.exports = router;
