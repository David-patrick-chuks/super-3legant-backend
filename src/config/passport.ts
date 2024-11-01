import dotenv from 'dotenv';
import { Request } from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/User';
import axios from 'axios';

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


interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
}

// GitHub authentication strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      callbackURL: 'http://localhost:5555/api/auth/github/callback',
      passReqToCallback: true,
    },
    async (req : Request, accessToken: string, refreshToken: string, profile: any, done: (err: any, user?: any) => void) => {
      try {
        // Fetch user's emails using the access token
        const emailResponse = await axios.get<GitHubEmail[]>('https://api.github.com/user/emails', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
        });

        // Get the primary email (the first one usually)
        const email = emailResponse.data.find((email) => email.primary)?.email;

        // Check for existing user by GitHub ID
        const existingUserByGithubId = await User.findOne({ githubId: profile.id });

        if (existingUserByGithubId) {
          // User found by GitHub ID, sign token and return user
          const token = jwt.sign(
            { userId: existingUserByGithubId._id },
            process.env.JWT_SECRET || '',
            { expiresIn: '1h' } // Set token expiry as needed
          );

          // Optionally set the token in cookies or return it in the response
          req.res?.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000, // 1 hour
          });

          return done(null, existingUserByGithubId);
        }

        // Check if there's an existing user with the fetched email
        const existingUserByEmail = email ? await User.findOne({ email }) : null;

        if (existingUserByEmail) {
          // If email exists, link accounts (add GitHub ID to the user)
          existingUserByEmail.githubId = profile.id; // Optionally update GitHub ID
          await existingUserByEmail.save();

          const token = jwt.sign(
            { userId: existingUserByEmail._id },
            process.env.JWT_SECRET || '',
            { expiresIn: '1h' }
          );

          req.res?.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000,
          });

          return done(null, existingUserByEmail);
        }

        // If no email was found, we can't create a new user
        if (!email) {
          return done(new Error('Email is required to create a new user.'), null);
        }

        // Create a new user if no existing user is found
        const newUser = new User({
          githubId: profile.id,
          name: profile.displayName || '',
          email: email,
          picture: profile.photos?.[0]?.value || '',
        });

        await newUser.save();

        // Sign a JWT token for the new user
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
        return done(error);
      }
    }
  )
);
export default passport;
