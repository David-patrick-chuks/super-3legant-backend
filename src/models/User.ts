import { Schema, model, Document } from 'mongoose';

// Define the interface for the User document
export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password?: string;  // Optional for Google and GitHub signups
  picture?: string;   // Optional; may store profile picture
  googleId?: string;  // Optional; only populated for Google users
  githubId?: string;  // Optional; only populated for GitHub users
  otp?: string;       // Optional; for OTP verification
  otpExpiry?: Date;   // Optional; for OTP expiry time
}

// Create the user schema
const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // Optional for Google and GitHub signups
  picture: { type: String }, // Optional; may store profile picture
  googleId: { type: String, unique: true, sparse: true }, // Optional; only populated for Google users
  githubId: { type: String, unique: true, sparse: true }, // Optional; only populated for GitHub users
  otp: { type: String },      // Optional; for OTP verification
  otpExpiry: { type: Date },  // Optional; for OTP expiry time
});

// Create and export the User model
export const User = model<IUser>('User', userSchema);
