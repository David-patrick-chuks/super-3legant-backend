// src/routes/authRoutes.ts
import express from 'express';
import {
  register,
  login,
  googleAuth,
  googleAuthCallback,
} from '../controllers/authController';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/google', googleAuth);  // Initiates Google OAuth
router.get('/google/callback', googleAuthCallback);  // Handles callback

export default router;
