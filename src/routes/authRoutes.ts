// src/routes/authRoutes.ts
import express from 'express';
import {
  checkAuth,
  googleAuth,
  googleAuthCallback,
  login,
  logout,
  register
} from '../controllers/authController';

const router = express.Router();


router.get('/check-auth', checkAuth); // Add check-auth route
router.post('/logout', logout);
router.post('/register', register);
router.post('/login', login);
router.get('/google', googleAuth);  // Initiates Google OAuth
router.get('/google/callback', googleAuthCallback);  // Handles callback

export default router;
