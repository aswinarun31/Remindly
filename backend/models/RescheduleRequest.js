const mongoose = require("mongoose");

const rescheduleRequestSchema = new mongoose.Schema({
    reminder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reminder",
        required: true
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    proposedDate: {
        type: String,
        required: true
    },
    proposedTime: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    reviewedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

rescheduleRequestSchema.virtual("id").get(function () {
    return this._id.toHexString();
});

module.exports = mongoose.model("RescheduleRequest", rescheduleRequestSchema);
