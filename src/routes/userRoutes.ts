// src/routes/userRoutes.ts (for example)
import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Get user profile - requires authentication
router.get('/profile', authMiddleware, getUserProfile);

// Update user profile - requires authentication
router.put('/update-profile', authMiddleware, updateUserProfile);

export default router;
