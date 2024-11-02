import { Request, Response } from 'express';
import { AIAgent } from '../models/AIAgent';

// Create a new AI agent
// export const createAIAgent = async (req: Request, res: Response) => {
//   try {
//     const { name, description, userId, ...otherData } = req.body; // Extract data from request body

//     const newAgent = new AIAgent({
//       ...otherData,
//       creatorId: userId, // Assuming you have a creatorId in your AIAgent schema
//     });

//     await newAgent.save();
//     res.status(201).json(newAgent);
//   } catch (error) {
//     console.error('Error creating AI agent:', error);
//     res.status(500).json({ message: 'Error creating AI agent' });
//   }
// };




// Create a new AI agent
export const createAIAgent = async (req: Request, res: Response) => {
  try {
    const { id } = req.body; // Extract only the id from the request body

 
    res.status(201).json({ message: `Agent with ID: ${id} has been created` }); // Respond with a confirmation message
  } catch (error) {
    console.error('Error creating AI agent:', error);
    res.status(500).json({ message: 'Error creating AI agent' });
  }
};







// // Get details of a specific AI agent
// export const getAIAgent = async (req: Request, res: Response) => {
//   const { agentId } = req.params;

//   try {
//     const agent = await AIAgent.findById(agentId);
//     if (!agent) {
//       return res.status(404).json({ message: 'AI agent not found' });
//     }
//     res.status(200).json(agent);
//   } catch (error) {
//     console.error('Error fetching AI agent:', error);
//     res.status(500).json({ message: 'Error fetching AI agent' });
//   }
// };

// // Update details of a specific AI agent
// export const updateAIAgent = async (req: Request, res: Response) => {
//   const { agentId } = req.params;

//   try {
//     const updatedAgent = await AIAgent.findByIdAndUpdate(agentId, req.body, { new: true });
//     if (!updatedAgent) {
//       return res.status(404).json({ message: 'AI agent not found' });
//     }
//     res.status(200).json(updatedAgent);
//   } catch (error) {
//     console.error('Error updating AI agent:', error);
//     res.status(500).json({ message: 'Error updating AI agent' });
//   }
// };

// // Delete an AI agent
// export const deleteAIAgent = async (req: Request, res: Response) => {
//   const { agentId } = req.params;

//   try {
//     const deletedAgent = await AIAgent.findByIdAndDelete(agentId);
//     if (!deletedAgent) {
//       return res.status(404).json({ message: 'AI agent not found' });
//     }
//     res.status(204).send(); // No content response
//   } catch (error) {
//     console.error('Error deleting AI agent:', error);
//     res.status(500).json({ message: 'Error deleting AI agent' });
//   }
// };

// // Get all AI agents created by a specific user
// export const getUserAIAgents = async (req: Request, res: Response) => {
//   const { userId } = req.params;

//   try {
//     const agents = await AIAgent.find({ creatorId: userId });
//     res.status(200).json(agents);
//   } catch (error) {
//     console.error('Error fetching user AI agents:', error);
//     res.status(500).json({ message: 'Error fetching user AI agents' });
//   }
// };
