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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.githubAuthCallback = exports.githubAuth = exports.checkAuth = exports.logout = exports.googleAuthCallback = exports.googleAuth = exports.login = exports.resendOTP = exports.verifyOTP = exports.register = exports.resetPassword = exports.forgotPassword = void 0;
const User_1 = require("../models/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const passport_1 = __importDefault(require("passport"));
require("../config/passport"); // Ensure Passport config is loaded
const profilePictureService_1 = require("../services/profilePictureService");
const emailService_1 = require("../services/emailService");
const crypto_1 = __importDefault(require("crypto"));
const hashUtils_1 = require("../utils/hashUtils");
// Utility function to generate a 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
// Forgot Password
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const user = yield User_1.User.findOne({ email });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        // Generate a password reset token and expiry time
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiry = new Date(Date.now() + 30 * 60 * 1000); // Token valid for 30 minutes
        yield user.save();
        // Create the reset link
        const resetLink = `http://localhost:3000/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
        // Send password reset email
        yield (0, emailService_1.sendPasswordResetEmail)(email, resetLink); // Use the email service function
        res.status(200).json({ message: 'Password reset link sent successfully' });
    }
    catch (error) {
        console.error('Error in forgot password:', error);
        res.status(400).json({ message: 'Error sending password reset email' });
    }
});
exports.forgotPassword = forgotPassword;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, email, newPassword } = req.body;
    try {
        const user = yield User_1.User.findOne({ email, resetPasswordToken: token });
        // Check if the user exists and if resetPasswordExpiry is valid
        if (!user || (user.resetPasswordExpiry && user.resetPasswordExpiry < new Date())) {
            res.status(400).json({ message: 'Invalid or expired token' });
            return;
        }
        // Hash new password (make sure to use your hashing function)
        user.password = yield (0, hashUtils_1.hashPassword)(newPassword); // Ensure this function is implemented
        user.resetPasswordToken = undefined; // Clear token
        user.resetPasswordExpiry = undefined; // Clear expiry
        yield user.save();
        res.status(200).json({ message: 'Password reset successfully' });
    }
    catch (error) {
        console.error('Error resetting password:', error);
        res.status(400).json({ message: 'Error resetting password' });
    }
});
exports.resetPassword = resetPassword;
// Register a new user and send OTP
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    try {
        const picture = yield (0, profilePictureService_1.generateProfilePicture)(name);
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // OTP valid for 15 minutes
        const user = new User_1.User({ name, email, password: hashedPassword, picture, otp, otpExpiry });
        // Send OTP email using the email service
        yield (0, emailService_1.sendOTPEmail)(name, email, otp);
        yield user.save();
        res.status(201).json({ message: 'User registered successfully. Check your email for the OTP.' });
    }
    catch (error) {
        console.error('Error registering user:', error);
        res.status(400).json({ message: 'Error registering user' });
    }
});
exports.register = register;
// Verify the OTP
const verifyOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp } = req.body;
    try {
        const user = yield User_1.User.findOne({ email });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        if (user.otp !== otp) {
            res.status(400).json({ message: 'Invalid OTP' });
            return;
        }
        if (user.otpExpiry && new Date() > user.otpExpiry) {
            res.status(400).json({ message: 'OTP expired. Please request a new one.' });
            return;
        }
        // OTP is valid, clear OTP fields and send welcome email
        user.otp = undefined;
        user.otpExpiry = undefined;
        yield user.save();
        // Send the welcome email using the email service
        yield (0, emailService_1.sendWelcomeEmail)(user.name, email);
        res.status(200).json({ message: 'Email verified successfully. Welcome email sent!' });
    }
    catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(400).json({ message: 'Error verifying OTP' });
    }
});
exports.verifyOTP = verifyOTP;
// Resend OTP
const resendOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const user = yield User_1.User.findOne({ email });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        // Generate new OTP and expiry time
        const otp = generateOTP();
        user.otp = otp;
        user.otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // Valid for 15 minutes
        yield user.save();
        // Send new OTP email using the email service
        yield (0, emailService_1.resendOTPEmail)(user.name, email, otp);
        res.status(200).json({ message: 'New OTP sent successfully' });
    }
    catch (error) {
        console.error('Error resending OTP:', error);
        res.status(400).json({ message: 'Error resending OTP' });
    }
});
exports.resendOTP = resendOTP;
// User login
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield User_1.User.findOne({ email });
        if (user && user.password && (yield bcryptjs_1.default.compare(password, user.password))) { // Ensure user.password is defined
            const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET || '', { expiresIn: '1h' });
            // Set the JWT as an HTTP-only cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
                sameSite: 'strict',
                maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
            });
            res.json({ user: { name: user.name, email: user.email, picture: user.picture } });
        }
        else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    }
    catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.login = login;
exports.googleAuth = passport_1.default.authenticate('google', {
    scope: ['profile', 'email'],
});
// Google OAuth callback
const googleAuthCallback = (req, res) => {
    passport_1.default.authenticate('google', { session: false }, (error, user) => {
        if (error || !user) {
            console.error('Google authentication failed:', error);
            return res.status(400).json({ message: 'Google authentication failed' });
        }
        // User is authenticated; redirect to the frontend application
        res.redirect('http://localhost:3000/profile'); // Adjust the URL to your frontend route
    })(req, res);
};
exports.googleAuthCallback = googleAuthCallback;
// Logout function
const logout = (req, res) => {
    // Clear the cookie
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
};
exports.logout = logout;
// Check if the user is authenticated
// Define the expected payload structure from the JWT
const checkAuth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies.token; // Get the token from cookies
    if (!token) {
        res.status(401).json({ message: 'No token provided, unauthorized' });
        return;
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || '', (error, decoded) => __awaiter(void 0, void 0, void 0, function* () {
        if (error || !decoded) {
            res.status(401).json({ message: 'Token is invalid or expired' });
            return;
        }
        // Token is valid, find the user
        try {
            const user = yield User_1.User.findById(decoded.userId);
            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            // Return user information if authenticated
            res.status(200).json({
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    picture: user.picture,
                },
            });
        }
        catch (err) {
            console.error('Error finding user:', err);
            res.status(500).json({ message: 'Internal server error' });
        }
    }));
});
exports.checkAuth = checkAuth;
exports.githubAuth = passport_1.default.authenticate('github', {
    scope: ['user:email'], // Request access to user's email
});
// GitHub OAuth callback
const githubAuthCallback = (req, res) => {
    passport_1.default.authenticate('github', { session: false }, (error, user) => {
        if (error || !user) {
            console.error('GitHub authentication failed:', error);
            return res.status(400).json({ message: 'GitHub authentication failed' });
        }
        // User is authenticated; redirect to the frontend application
        res.redirect('http://localhost:3000/profile'); // Adjust the URL to your frontend route
    })(req, res);
};
exports.githubAuthCallback = githubAuthCallback;
