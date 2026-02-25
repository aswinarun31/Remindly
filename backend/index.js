const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// connect db
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("🔥 MongoDB connected"))
  .catch(err => console.log("❌ DB error:", err));

// routes
app.use("/api/reminders", require("./routes/reminders"));

app.listen(PORT, () => console.log(`⚡ Server running on http://localhost:${PORT}`));
app.get("/", (req, res) => {
  res.send("Backend is running");
});
const errorHandler = require("./middleware/errorHandler");

app.use(errorHandler);
