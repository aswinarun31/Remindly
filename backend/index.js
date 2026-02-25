const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
require("dotenv").config();

// Passport config (must load after dotenv)
const passport = require("./config/passport");

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:8080",
    credentials: true,
  })
);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Session (required by Passport even when using JWT)  ──────────────────────
app.use(
  session({
    secret: process.env.SESSION_SECRET || "remindly-session-secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());

// ── Database ──────────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("🔥 MongoDB connected"))
  .catch((err) => console.log("❌ DB error:", err));

// ── Routes ────────────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.send("Remindly backend is running ✅"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/reminders", require("./routes/reminders"));

// ── Error Handler ─────────────────────────────────────────────────────────────
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`⚡ Server running on http://localhost:${PORT}`));
