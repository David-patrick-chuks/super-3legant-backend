"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/userRoutes.ts (for example)
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Get user profile - requires authentication
router.get('/profile', authMiddleware_1.authMiddleware, userController_1.getUserProfile);
// Update user profile - requires authentication
router.put('/update-profile', authMiddleware_1.authMiddleware, userController_1.updateUserProfile);
// get user usage stats - requires authentication
router.get('/usage-stats', authMiddleware_1.authMiddleware, userController_1.getUsageStats);
exports.default = router;
