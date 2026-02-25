const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        // not required — Google OAuth users won't have a password
        default: null
    },
    role: {
        type: String,
        enum: ["admin", "student"],
        default: "student"
    },
    googleId: {
        type: String,
        default: null
    },
    avatar: {
        type: String,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

userSchema.virtual("id").get(function () {
    return this._id.toHexString();
});

module.exports = mongoose.model("User", userSchema);
