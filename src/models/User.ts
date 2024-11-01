import { Schema, model, Document } from 'mongoose';

// Define the interface for the User document
export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password?: string;  // Optional for Google signups
  picture?: string;   // Optional; may store Google profile picture
  googleId?: string;  // Optional; only populated for Google users
}

// Create the user schema
const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // Optional for Google signups
  picture: { type: String }, // Optional; may store Google profile picture
  googleId: { type: String, unique: true, sparse: true }, // Optional; only populated for Google users
});

// Create and export the User model
export const User = model<IUser>('User', userSchema);
