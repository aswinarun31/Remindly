const Reminder = require("../models/Reminder");

// @desc    Get all reminders
// @route   GET /api/reminders
exports.getReminders = async (req, res, next) => {
  try {
    const reminders = await Reminder.find().sort({ date: 1, time: 1 });
    res.status(200).json(reminders);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a reminder
// @route   POST /api/reminders
exports.createReminder = async (req, res, next) => {
  try {
    const { title, description, date, time, priority, category, recurring, notificationType } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    if (!time) {
      return res.status(400).json({ message: "Time is required" });
    }

    const reminder = await Reminder.create({
      title,
      description,
      date,
      time,
      priority: priority || "medium",
      category: category || "other",
      status: "pending",
      recurring: recurring || false,
      notificationType: notificationType || "app"
    });

    res.status(201).json(reminder);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a reminder
// @route   PUT /api/reminders/:id
exports.updateReminder = async (req, res, next) => {
  try {
    const reminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    res.status(200).json(reminder);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a reminder
// @route   DELETE /api/reminders/:id
exports.deleteReminder = async (req, res, next) => {
  try {
    const reminder = await Reminder.findByIdAndDelete(req.params.id);

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    res.status(200).json({ message: "Reminder deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle reminder completion status
// @route   PATCH /api/reminders/:id/toggle
exports.toggleComplete = async (req, res, next) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    reminder.status = reminder.status === "completed" ? "pending" : "completed";
    await reminder.save();

    res.status(200).json(reminder);
  } catch (error) {
    next(error);
  }
};
