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
    enum: ["work", "personal", "health", "finance", "other"],
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
  }
}, { timestamps: true });

module.exports = mongoose.model("Reminder", reminderSchema);
