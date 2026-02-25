const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  },
  category: {
    type: String,
    enum: ["work", "personal", "health", "finance", "academic", "other"],
    default: "other"
  },
  status: {
    type: String,
    enum: ["pending", "completed", "overdue"],
    default: "pending"
  },
  recurring: {
    type: Boolean,
    default: false
  },
  notificationType: {
    type: String,
    enum: ["email", "app", "both"],
    default: "app"
  },

  // RBAC fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  createdByRole: {
    type: String,
    enum: ["admin", "student"],
    required: true
  },
  // For admin-created reminders: list of student IDs it's assigned to
  // Empty means it applies to ALL students (broadcast)
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  // Filter used when admin created it (stored for display)
  targetFilter: {
    type: String,
    default: "all" // e.g. "all", "specific"
  },
  // Admin reminders are locked — students cannot edit/delete
  isLocked: {
    type: Boolean,
    default: false
  },
  // Duration in minutes for overlap detection
  durationMinutes: {
    type: Number,
    default: 60
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

reminderSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model("Reminder", reminderSchema);
