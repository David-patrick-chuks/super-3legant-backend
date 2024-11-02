"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsageStats = exports.updateUserProfile = exports.getUserProfile = void 0;
const User_1 = require("../models/User");
const AIAgent_1 = require("../models/AIAgent");
const Chat_1 = require("../models/Chat");
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Received request for user profile with ID:', req.query.id);
    const userId = req.query.id;
    if (!userId) {
        console.log('User ID missing');
        res.status(400).json({ message: 'User ID is required' });
        return;
    }
    try {
        const user = yield User_1.User.findById(userId);
        if (!user) {
            console.log('User not found');
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const _a = user.toObject(), { password } = _a, userData = __rest(_a, ["password"]);
        console.log('User data fetched successfully:', userData);
        res.status(200).json(userData);
    }
    catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Error fetching user profile' });
    }
});
exports.getUserProfile = getUserProfile;
// Update user profile
const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email } = req.body; // Assuming we only allow name and email to be updated
    try {
        const user = yield User_1.User.findByIdAndUpdate(req.userId, { name, email }, { new: true }).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json(user);
    }
    catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.updateUserProfile = updateUserProfile;
const getUsageStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId; // Now using userId from the middleware
    try {
        // Count the number of chats for this user
        const chatCount = yield Chat_1.Chat.countDocuments({ userId });
        // Count the number of AI agents created by this user
        const agentCount = yield AIAgent_1.AIAgent.countDocuments({ creatorId: userId }); // Adjust according to your schema
        // Prepare the statistics response
        const usageStats = {
            chatCount,
            agentCount,
        };
        res.status(200).json(usageStats);
    }
    catch (error) {
        console.error('Error retrieving usage stats:', error);
        res.status(500).json({ message: 'Error retrieving usage statistics' });
    }
});
exports.getUsageStats = getUsageStats;
