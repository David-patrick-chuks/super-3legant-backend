import { Request, Response } from 'express';
import { User } from '../models/User';

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' }); // No need to return here
      return; // Return early to avoid further execution
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile' });
  }
};
