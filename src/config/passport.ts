import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('Google Client ID:', process.env.GOOGLE_CLIENT_ID);
console.log('Google Client Secret:', process.env.GOOGLE_CLIENT_SECRET);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: 'http://localhost:5173/auth/google/callback', // Adjust as necessary for your environment
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if the user already exists using googleId
        const existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) {
          // If user exists, generate JWT and return
          const token = jwt.sign(
            { userId: existingUser._id },
            process.env.JWT_SECRET || '',
            { expiresIn: '1h' }
          );
          return done(null, { user: existingUser, token });
        }

        // If user doesn't exist, create and save new user
        const newUser = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails?.[0]?.value,
          picture: profile.photos?.[0]?.value || '', // Optional: Save profile picture if available
        });

        await newUser.save(); // Save the new user

        // Generate JWT for the new user
        const token = jwt.sign(
          { userId: newUser._id },
          process.env.JWT_SECRET || '',
          { expiresIn: '1h' }
        );

        return done(null, { user: newUser, token });
      } catch (error) {
        console.error('Error during Google authentication:', error); // Log the error for debugging
        return done(error, undefined); // Use undefined instead of null
      }
    }
  )
);

export default passport;
