// src/routes/authRoutes.ts
import express from 'express';
import {
  checkAuth,
  googleAuth,
  googleAuthCallback,
  githubAuth,
  githubAuthCallback,
  login,
  logout,
  register,
  verifyOTP, 
  resendOTP,
  forgotPassword, // Import the forgotPassword controller function
  resetPassword
} from '../controllers/authController';

const router = express.Router();

// Check authentication status
router.get('/check-auth', checkAuth);

// User actions
router.post('/logout', logout);
router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP); 
router.post('/resend-otp', resendOTP); 
router.post('/forgot-password', forgotPassword); // Route for forgot password
router.post('/reset-password', resetPassword); // Route for forgot password

// Google authentication routes
router.get('/google', googleAuth);  
router.get('/google/callback', googleAuthCallback);  

// GitHub authentication routes
router.get('/github', githubAuth);  
router.get('/github/callback', githubAuthCallback);  

export default router;
