import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { createAIAgent } from '../controllers/aiAgentController';

const router = express.Router();

// Create a new AI agent
router.post('/create', createAIAgent);

// Get details of a specific AI agent
// router.get('/:agentId', authMiddleware, getAIAgent);

// Update details of a specific AI agent
// router.put('/:agentId', authMiddleware, updateAIAgent);

// Delete an AI agent
// router.delete('/:agentId', authMiddleware, deleteAIAgent);

// Get all AI agents created by a specific user
// router.get('/user/:userId', authMiddleware, getUserAIAgents);

export default router;
