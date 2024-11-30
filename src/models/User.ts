import { Schema, model, Document } from 'mongoose';
import { connections } from '../config/db';

// Define the interface for the User document
export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  clientIp: string;
  password?: string;  // Optional for users authenticated through social logins
  picture?: string;   // Profile picture URL
  googleId?: string;  // Optional; only populated for Google users
  githubId?: string;  // Optional; only populated for GitHub users
  otp?: string;       // Optional; for OTP verification
  otpExpiry?: Date;   // Optional; for OTP expiry time
  resetPasswordToken?: string; // Optional; for password reset token
  resetPasswordExpiry?: Date;  // Optional; for password reset expiry time
  plan?: 'free' | 'pro' | 'business' | 'enterprise'; // Subscription plan type
  aiAgents?: string[]; // IDs of AI agents created by the user
  usageStats?: {
    messagesSent: number;
    botsCreated: number;
    charsUsed: number;
  }; // Optional; statistics for user usage
  addOns?: string[];  // Track active add-ons
  addOnsBillingCycle?: string,
  billingCycle?: string;
}

// Create the user schema
const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  clientIp: { type: String, required: true },
  password: { type: String }, // Optional for social login
  picture: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  githubId: { type: String, unique: true, sparse: true },
  otp: { type: String },
  otpExpiry: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpiry: { type: Date },
  plan: { type: String, enum: ['free', 'pro', 'business', 'enterprise'], default: 'free' },
  aiAgents: [{ type: Schema.Types.ObjectId, ref: 'AIAgent' }],
  usageStats: {
    messagesSent: { type: Number, default: 0 },
    botsCreated: { type: Number, default: 0 },
    charsUsed: { type: Number, default: 0 }
  },
  billingCycle: { type: String, required: true },
  addOnsBillingCycle: { type: String, required: true },
  addOns: [{ type: String }]  // Store add-ons as an array of strings
});

export const saveUserToCluster = async (data: any, clusterName: string) => {
  try {
    const connection = connections[clusterName];
    if (!connection) {
      throw new Error(`No MongoDB connection found for ${clusterName}`);
    }

    // Create the model using the selected connection
    const UserModel = connection.model<IUser>('User', userSchema);

    // Save the user data
    const user = new UserModel(data);
    await user.save();
    console.log(`User saved to ${clusterName}`);
  } catch (error) {
    console.error(`Error saving user to ${clusterName}:`, error);
  }
};

// Create and export the User model
export const User = model<IUser>('User', userSchema);
