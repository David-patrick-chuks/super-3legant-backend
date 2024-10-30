import { Router } from 'express';
import { getUserProfile } from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/:id', authMiddleware, getUserProfile);

export default router;
