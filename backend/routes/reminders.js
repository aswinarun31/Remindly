const express = require("express");
const router = express.Router();
const {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  toggleComplete
} = require("../controllers/reminderController");

// GET all reminders
router.get("/", getReminders);

// POST new reminder
router.post("/", createReminder);

// PUT update reminder
router.put("/:id", updateReminder);

// PATCH toggle completion status
router.patch("/:id/toggle", toggleComplete);

// DELETE reminder
router.delete("/:id", deleteReminder);

module.exports = router;
