const express = require("express");
const router = express.Router();
const {
  getReminders,
  adminCreateReminder,
  studentCreateReminder,
  updateReminder,
  deleteReminder,
  toggleComplete,
  requestReschedule,
  getRescheduleRequests,
  getMyRescheduleRequests,
  reviewRescheduleRequest,
} = require("../controllers/reminderController");
const { protect, adminOnly, studentOnly } = require("../middleware/auth");

// All reminder routes require authentication
router.use(protect);

// GET all reminders (filtered by role internally)
router.get("/", getReminders);

// Admin creates reminders for students
router.post("/admin", adminOnly, adminCreateReminder);

// Student creates personal reminders (with overlap check)
router.post("/student", studentOnly, studentCreateReminder);

// Update reminder
router.put("/:id", updateReminder);

// Delete reminder
router.delete("/:id", deleteReminder);

// Toggle completion status
router.patch("/:id/toggle", toggleComplete);

// ── Reschedule Requests ──────────────────────────

// Student: request rescheduling of an admin reminder
router.post("/:id/reschedule", studentOnly, requestReschedule);

// Student: view their own reschedule requests
router.get("/reschedule/mine", studentOnly, getMyRescheduleRequests);

// Admin: view all reschedule requests
router.get("/reschedule/all", adminOnly, getRescheduleRequests);

// Admin: approve or reject a reschedule request
router.patch("/reschedule/:requestId/review", adminOnly, reviewRescheduleRequest);

module.exports = router;
