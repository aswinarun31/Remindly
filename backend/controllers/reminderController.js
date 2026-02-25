const Reminder = require("../models/Reminder");
const User = require("../models/User");
const RescheduleRequest = require("../models/RescheduleRequest");

// Helper: check if two reminders overlap
const hasOverlap = (existingDate, existingTime, existingDuration, newDate, newTime, newDuration) => {
  if (existingDate !== newDate) return false;

  const toMinutes = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  const existStart = toMinutes(existingTime);
  const existEnd = existStart + (existingDuration || 60);
  const newStart = toMinutes(newTime);
  const newEnd = newStart + (newDuration || 60);

  return newStart < existEnd && newEnd > existStart;
};

// ─────────────────────────────────────────────
// SHARED: Get reminders visible to current user
// ─────────────────────────────────────────────
exports.getReminders = async (req, res, next) => {
  try {
    const { user } = req;
    let reminders;

    if (user.role === "admin") {
      // Admin sees all reminders
      reminders = await Reminder.find()
        .populate("createdBy", "name email role")
        .populate("assignedTo", "name email")
        .sort({ date: 1, time: 1 });
    } else {
      // Student sees: their own reminders + admin reminders assigned to them or broadcast (all)
      reminders = await Reminder.find({
        $or: [
          { createdBy: user._id },
          { assignedTo: user._id },
          { assignedTo: { $size: 0 }, createdByRole: "admin" }, // broadcast
        ],
      })
        .populate("createdBy", "name email role")
        .populate("assignedTo", "name email")
        .sort({ date: 1, time: 1 });
    }

    res.status(200).json(reminders);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// ADMIN: Create reminder for students
// ─────────────────────────────────────────────
exports.adminCreateReminder = async (req, res, next) => {
  try {
    const { user } = req;
    const {
      title, description, date, time, priority, category, recurring,
      notificationType, assignedTo, targetFilter, durationMinutes
    } = req.body;

    if (!title || !date || !time)
      return res.status(400).json({ message: "Title, date, and time are required" });

    const reminder = await Reminder.create({
      title,
      description,
      date,
      time,
      priority: priority || "medium",
      category: category || "academic",
      status: "pending",
      recurring: recurring || false,
      notificationType: notificationType || "app",
      createdBy: user._id,
      createdByRole: "admin",
      assignedTo: assignedTo || [],
      targetFilter: targetFilter || "all",
      isLocked: true,
      durationMinutes: durationMinutes || 60,
    });

    await reminder.populate("createdBy", "name email role");
    await reminder.populate("assignedTo", "name email");

    res.status(201).json(reminder);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// STUDENT: Create personal reminder (with overlap check)
// ─────────────────────────────────────────────
exports.studentCreateReminder = async (req, res, next) => {
  try {
    const { user } = req;
    const {
      title, description, date, time, priority, category,
      recurring, notificationType, durationMinutes
    } = req.body;

    if (!title || !date || !time)
      return res.status(400).json({ message: "Title, date, and time are required" });

    const dur = durationMinutes || 60;

    // Find admin reminders on the same date that are visible to this student
    const adminReminders = await Reminder.find({
      date,
      createdByRole: "admin",
      $or: [
        { assignedTo: user._id },
        { assignedTo: { $size: 0 } }, // broadcast
      ],
    });

    // Check overlaps
    const overlapping = adminReminders.filter((r) =>
      hasOverlap(r.date, r.time, r.durationMinutes, date, time, dur)
    );

    if (overlapping.length > 0) {
      return res.status(409).json({
        message: "Time slot overlaps with an admin task",
        overlapping: overlapping.map((r) => ({
          id: r.id,
          title: r.title,
          date: r.date,
          time: r.time,
          durationMinutes: r.durationMinutes,
        })),
      });
    }

    const reminder = await Reminder.create({
      title,
      description,
      date,
      time,
      priority: priority || "medium",
      category: category || "personal",
      status: "pending",
      recurring: recurring || false,
      notificationType: notificationType || "app",
      createdBy: user._id,
      createdByRole: "student",
      assignedTo: [user._id],
      isLocked: false,
      durationMinutes: dur,
    });

    await reminder.populate("createdBy", "name email role");

    res.status(201).json(reminder);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// Update reminder (student can only update their own unlocked reminders)
// ─────────────────────────────────────────────
exports.updateReminder = async (req, res, next) => {
  try {
    const { user } = req;
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder)
      return res.status(404).json({ message: "Reminder not found" });

    // Students cannot modify locked (admin) reminders
    if (user.role === "student" && reminder.isLocked)
      return res.status(403).json({ message: "Admin reminders cannot be modified. Use reschedule request instead." });

    // Students can only update their own reminders
    if (user.role === "student" && reminder.createdBy.toString() !== user._id.toString())
      return res.status(403).json({ message: "Not authorized to update this reminder" });

    const updated = await Reminder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("createdBy", "name email role");

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// Delete reminder
// ─────────────────────────────────────────────
exports.deleteReminder = async (req, res, next) => {
  try {
    const { user } = req;
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder)
      return res.status(404).json({ message: "Reminder not found" });

    if (user.role === "student") {
      if (reminder.isLocked)
        return res.status(403).json({ message: "Admin reminders cannot be deleted by students" });
      if (reminder.createdBy.toString() !== user._id.toString())
        return res.status(403).json({ message: "Not authorized to delete this reminder" });
    }

    await Reminder.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Reminder deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// Toggle complete
// ─────────────────────────────────────────────
exports.toggleComplete = async (req, res, next) => {
  try {
    const { user } = req;
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder)
      return res.status(404).json({ message: "Reminder not found" });

    // Students can toggle their own, and admin-assigned ones
    if (user.role === "student") {
      const isAssigned =
        reminder.createdBy.toString() === user._id.toString() ||
        reminder.assignedTo.some((id) => id.toString() === user._id.toString()) ||
        (reminder.assignedTo.length === 0 && reminder.createdByRole === "admin");

      if (!isAssigned)
        return res.status(403).json({ message: "Not authorized" });
    }

    reminder.status = reminder.status === "completed" ? "pending" : "completed";
    await reminder.save();
    res.status(200).json(reminder);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// STUDENT: Request reschedule for an admin reminder
// ─────────────────────────────────────────────
exports.requestReschedule = async (req, res, next) => {
  try {
    const { user } = req;
    const { proposedDate, proposedTime, reason } = req.body;
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder)
      return res.status(404).json({ message: "Reminder not found" });

    if (!reminder.isLocked)
      return res.status(400).json({ message: "Reschedule requests are only for admin reminders" });

    // Check if student already has a pending request for this reminder
    const existing = await RescheduleRequest.findOne({
      reminder: reminder._id,
      requestedBy: user._id,
      status: "pending",
    });
    if (existing)
      return res.status(409).json({ message: "You already have a pending reschedule request for this reminder" });

    const request = await RescheduleRequest.create({
      reminder: reminder._id,
      requestedBy: user._id,
      proposedDate,
      proposedTime,
      reason: reason || "",
    });

    await request.populate("reminder", "title date time");
    await request.populate("requestedBy", "name email");

    res.status(201).json(request);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// ADMIN: Get all reschedule requests
// ─────────────────────────────────────────────
exports.getRescheduleRequests = async (req, res, next) => {
  try {
    const requests = await RescheduleRequest.find()
      .populate("reminder", "title date time")
      .populate("requestedBy", "name email")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    next(error);
  }
};

// STUDENT: Get their own reschedule requests
exports.getMyRescheduleRequests = async (req, res, next) => {
  try {
    const requests = await RescheduleRequest.find({ requestedBy: req.user._id })
      .populate("reminder", "title date time")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// ADMIN: Review (approve/reject) a reschedule request
// ─────────────────────────────────────────────
exports.reviewRescheduleRequest = async (req, res, next) => {
  try {
    const { status } = req.body; // "approved" or "rejected"
    if (!["approved", "rejected"].includes(status))
      return res.status(400).json({ message: "Status must be 'approved' or 'rejected'" });

    const request = await RescheduleRequest.findById(req.params.requestId);
    if (!request)
      return res.status(404).json({ message: "Request not found" });

    request.status = status;
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    // If approved, update the reminder's time
    if (status === "approved") {
      await Reminder.findByIdAndUpdate(request.reminder, {
        date: request.proposedDate,
        time: request.proposedTime,
      });
    }

    res.status(200).json(request);
  } catch (error) {
    next(error);
  }
};
