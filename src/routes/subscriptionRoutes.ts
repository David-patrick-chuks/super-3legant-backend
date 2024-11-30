// routes/subscriptionRoutes.ts
import express from 'express';
import { subscribeToPlan, subscribeToAddons } from '../controllers/subscriptionController';

const router = express.Router();

// Route to subscribe to a plan
router.post('/subscribe/plan', subscribeToPlan);

// Route to subscribe to add-ons
router.post('/subscribe/addon', subscribeToAddons);

export default router;
