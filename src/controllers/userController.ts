import { Request, Response } from 'express';
import { User } from '../models/User';

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  console.log('Received request for user profile with ID:', req.query.id);

  const userId = req.query.id as string;
  if (!userId) {
    console.log('User ID missing');
    res.status(400).json({ message: 'User ID is required' });
    return;
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found');
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const { password, ...userData } = user.toObject();
    console.log('User data fetched successfully:', userData);
    res.status(200).json(userData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
};
// Update user profile
export const updateUserProfile = async (req: Request, res: Response): Promise<void>  => {
  const { name, email } = req.body; // Assuming we only allow name and email to be updated
  try {
    const user = await User.findByIdAndUpdate(req.userId, { name, email }, { new: true }).select('-password');
    if (!user) {
       res.status(404).json({ message: 'User not found' })
       return
    }
    res.json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};