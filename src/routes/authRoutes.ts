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
  register
} from '../controllers/authController';

const router = express.Router();

// Check authentication status
router.get('/check-auth', checkAuth); 

// User actions
router.post('/logout', logout);
router.post('/register', register);
router.post('/login', login);

// Google authentication routes
router.get('/google', googleAuth);  // Initiates Google OAuth
router.get('/google/callback', googleAuthCallback);  // Handles Google callback

// GitHub authentication routes
router.get('/github', githubAuth);  // Initiates GitHub OAuth
router.get('/github/callback', githubAuthCallback);  // Handles GitHub callback

export default router;
