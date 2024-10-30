// src/controllers/authController.ts
import { Request, Response } from 'express';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import '../config/passport'; // Ensure Passport config is loaded

// Register a new user
export const register = async (req: Request, res: Response) => {
  const { name, email, password, picture } = req.body; // Include picture in registration

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, picture }); // Save picture if provided

    await user.save();
    res.status(201).json({ message: 'User registered successfully', user: { name, email, picture } });
  } catch (error: unknown) { // Specify error as 'unknown'
    const errorMessage = error instanceof Error ? error.message : 'Error registering user'; // Type assertion
    console.error('Error registering user:', error);
    res.status(400).json({ message: errorMessage });
  }
};

// User login
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user && user.password && (await bcrypt.compare(password, user.password))) { // Ensure user.password is defined
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || '', { expiresIn: '1h' });
      res.json({ token, user: { name: user.name, email: user.email, picture: user.picture } });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Google OAuth login (initiate Google login)
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

// Google OAuth callback
export const googleAuthCallback = (req: Request, res: Response) => {
  passport.authenticate('google', { session: false }, (error, userWithToken) => {
    if (error || !userWithToken) {
      console.error('Google authentication failed:', error);
      return res.status(400).json({ message: 'Google authentication failed' });
    }
    
    // Send back the user details and token
    const { user, token } = userWithToken;
    res.json({ user: { name: user.name, email: user.email, picture: user.picture }, token });
  })(req, res);
};
