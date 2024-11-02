// src/controllers/authController.ts
import { Request, Response } from 'express';
import { IUser, User } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import '../config/passport'; // Ensure Passport config is loaded
import { generateProfilePicture } from '../services/profilePictureService';
import { resendOTPEmail, sendOTPEmail, sendPasswordResetEmail, sendWelcomeEmail } from '../services/emailService';
import crypto from 'crypto';
import { hashPassword } from '../utils/hashUtils';


// Utility function to generate a 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


// Forgot Password
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    // Generate a password reset token and expiry time
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = new Date(Date.now() + 30 * 60 * 1000); // Token valid for 30 minutes
    await user.save();

    // Create the reset link
    const resetLink = `http://localhost:3000/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Send password reset email
    await sendPasswordResetEmail(email, resetLink); // Use the email service function

    res.status(200).json({ message: 'Password reset link sent successfully' });
  } catch (error: unknown) {
    console.error('Error in forgot password:', error);
    res.status(400).json({ message: 'Error sending password reset email' });
  }
};




export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token, email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email, resetPasswordToken: token });

    // Check if the user exists and if resetPasswordExpiry is valid
    if (!user || (user.resetPasswordExpiry && user.resetPasswordExpiry < new Date())) {
      res.status(400).json({ message: 'Invalid or expired token' })
      return
    }

    // Hash new password (make sure to use your hashing function)
    user.password = await hashPassword(newPassword); // Ensure this function is implemented
    user.resetPasswordToken = undefined; // Clear token
    user.resetPasswordExpiry = undefined; // Clear expiry
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error: unknown) {
    console.error('Error resetting password:', error);
    res.status(400).json({ message: 'Error resetting password' });
  }
};



// Register a new user and send OTP
export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    const picture = await generateProfilePicture(name);
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // OTP valid for 15 minutes

    const user = new User({ name, email, password: hashedPassword, picture, otp, otpExpiry });


    // Send OTP email using the email service
    await sendOTPEmail(name, email, otp);

    await user.save();

    res.status(201).json({ message: 'User registered successfully. Check your email for the OTP.' });
  } catch (error: unknown) {
    console.error('Error registering user:', error);
    res.status(400).json({ message: 'Error registering user' });
  }
};

// Verify the OTP
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    if (user.otp !== otp) {
      res.status(400).json({ message: 'Invalid OTP' })
      return
    }

    if (user.otpExpiry && new Date() > user.otpExpiry) {
      res.status(400).json({ message: 'OTP expired. Please request a new one.' })
      return
    }

    // OTP is valid, clear OTP fields and send welcome email
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Send the welcome email using the email service
    await sendWelcomeEmail(user.name, email);

    res.status(200).json({ message: 'Email verified successfully. Welcome email sent!' });
  } catch (error: unknown) {
    console.error('Error verifying OTP:', error);
    res.status(400).json({ message: 'Error verifying OTP' });
  }
};

// Resend OTP
export const resendOTP = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    // Generate new OTP and expiry time
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // Valid for 15 minutes
    await user.save();

    // Send new OTP email using the email service
    await resendOTPEmail(user.name, email, otp);

    res.status(200).json({ message: 'New OTP sent successfully' });
  } catch (error: unknown) {
    console.error('Error resending OTP:', error);
    res.status(400).json({ message: 'Error resending OTP' });
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
  passport.authenticate('google', { session: false }, (error: Error | null, user: IUser | false) => {
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
// Define the expected payload structure from the JWT
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
          id: user._id,
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
  passport.authenticate('github', { session: false }, (error: Error | null, user: IUser | false) => {
    if (error || !user) {
      console.error('GitHub authentication failed:', error);
      return res.status(400).json({ message: 'GitHub authentication failed' });
    }
    // User is authenticated; redirect to the frontend application
    res.redirect('http://localhost:3000/profile'); // Adjust the URL to your frontend route
  })(req, res);
};