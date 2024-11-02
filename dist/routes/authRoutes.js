"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/authRoutes.ts
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const router = express_1.default.Router();
// Check authentication status
router.get('/check-auth', authController_1.checkAuth);
// User actions
router.post('/logout', authController_1.logout);
router.post('/register', authController_1.register);
router.post('/login', authController_1.login);
router.post('/verify-otp', authController_1.verifyOTP);
router.post('/resend-otp', authController_1.resendOTP);
router.post('/forgot-password', authController_1.forgotPassword); // Route for forgot password
router.post('/reset-password', authController_1.resetPassword); // Route for forgot password
// Google authentication routes
router.get('/google', authController_1.googleAuth);
router.get('/google/callback', authController_1.googleAuthCallback);
// GitHub authentication routes
router.get('/github', authController_1.githubAuth);
router.get('/github/callback', authController_1.githubAuthCallback);
exports.default = router;
