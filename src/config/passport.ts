import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/User';
import { Strategy as GitHubStrategy } from 'passport-github2';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Request } from 'express';

// Load environment variables
dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: 'http://localhost:5555/api/auth/google/callback', // Adjust to match your backend route
      passReqToCallback: true, // Enable passing req to callback to set cookie
    },
    async (req: Request, accessToken, refreshToken, profile, done) => {
      try {
        // Check if the user already exists
        const existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) {
          // If user exists, generate JWT
          const token = jwt.sign(
            { userId: existingUser._id },
            process.env.JWT_SECRET || '',
            { expiresIn: '1h' }
          );

          // Set the JWT in an HTTP-only cookie
          req.res?.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
          });

          return done(null, existingUser);
        }

        // If user doesn't exist, create and save a new user
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

        // Set the JWT in an HTTP-only cookie
        req.res?.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 60 * 60 * 1000, // 1 hour
        });

        return done(null, newUser);
      } catch (error) {
        console.error('Error during Google authentication:', error);
        return done(error, undefined);
      }
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      callbackURL: 'http://localhost:5555/api/auth/github/callback', // Adjust to match your backend route
      passReqToCallback: true,
    },
    async (req: Request, accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({ githubId: profile.id });

        if (existingUser) {
          const token = jwt.sign(
            { userId: existingUser._id },
            process.env.JWT_SECRET || '',
            { expiresIn: '1h' }
          );

          req.res?.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000,
          });

          return done(null, existingUser);
        }

        const newUser = new User({
          githubId: profile.id,
          name: profile.displayName || profile.username,
          email: profile.emails?.[0]?.value || '', // GitHub email is optional
          picture: profile.photos?.[0]?.value || '',
        });

        await newUser.save();

        const token = jwt.sign(
          { userId: newUser._id },
          process.env.JWT_SECRET || '',
          { expiresIn: '1h' }
        );

        req.res?.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 60 * 60 * 1000,
        });

        return done(null, newUser);
      } catch (error) {
        console.error('Error during GitHub authentication:', error);
        return done(error, undefined);
      }
    }
  )
);


export default passport;
