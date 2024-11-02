"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
// Create the user schema
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional for social login
    picture: { type: String },
    googleId: { type: String, unique: true, sparse: true },
    githubId: { type: String, unique: true, sparse: true },
    otp: { type: String },
    otpExpiry: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpiry: { type: Date },
    plan: { type: String, enum: ['free', 'pro', 'business', 'enterprise'], default: 'free' },
    aiAgents: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'AIAgent' }],
    usageStats: {
        messagesSent: { type: Number, default: 0 },
        botsCreated: { type: Number, default: 0 },
        charsUsed: { type: Number, default: 0 }
    }
});
// Create and export the User model
exports.User = (0, mongoose_1.model)('User', userSchema);
