// src/controllers/authController.ts
import { Request, Response } from 'express';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import '../config/passport'; // Ensure Passport config is loaded
import { generateProfilePicture } from '../services/profilePictureService';



// Register a new user
export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    // Generate profile picture
    const picture = await generateProfilePicture(name);

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, picture });

    await user.save();

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || '', { expiresIn: '1h' });

    // Set the JWT as an HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
    });

    res.status(201).json({ message: 'User registered successfully', user: { name, email, picture } });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error registering user';
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

      // Set the JWT as an HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
      });


      res.json({ user: { name: user.name, email: user.email, picture: user.picture } });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

// Google OAuth callback
export const googleAuthCallback = (req: Request, res: Response) => {
  passport.authenticate('google', { session: false }, (error, user) => {
    if (error || !user) {
      console.error('Google authentication failed:', error);
      return res.status(400).json({ message: 'Google authentication failed' });
    }
    // User is authenticated; redirect to the frontend application
    res.redirect('http://localhost:3000/profile'); // Adjust the URL to your frontend route
  })(req, res);
};
// Logout function
export const logout = (req: Request, res: Response) => {
  // Clear the cookie
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
};



// Check if the user is authenticated
// Define the expected payload structure from the JWT// Define the expected payload structure from the JWT
export const checkAuth = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies.token; // Get the token from cookies

  if (!token) {
    res.status(401).json({ message: 'No token provided, unauthorized' });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET || '', async (error: jwt.VerifyErrors | null, decoded: any) => {
    if (error || !decoded) {
      res.status(401).json({ message: 'Token is invalid or expired' });
      return;
    }

    // Token is valid, find the user
    try {
      const user = await User.findById(decoded.userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Return user information if authenticated
      res.status(200).json({
        user: {
          id : user._id,
          name: user.name,
          email: user.email,
          picture: user.picture,
        },
      });
    } catch (err) {
      console.error('Error finding user:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
};


export const githubAuth = passport.authenticate('github', {
  scope: ['user:email'], // Request access to user's email
});

// GitHub OAuth callback
export const githubAuthCallback = (req: Request, res: Response) => {
  passport.authenticate('github', { session: false }, (error, user) => {
    if (error || !user) {
      console.error('GitHub authentication failed:', error);
      return res.status(400).json({ message: 'GitHub authentication failed' });
    }
    // User is authenticated; redirect to the frontend application
    res.redirect('http://localhost:3000/profile'); // Adjust the URL to your frontend route
  })(req, res);
};