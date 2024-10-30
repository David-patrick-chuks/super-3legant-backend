import { Schema, model, Document } from 'mongoose';


interface IUser extends Document {
  name: string,
  email: string,
  password?: string,
  picture?: string,
  googleId?: string
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // Optional for Google signups
  picture: { type: String }, // Optional; may store Google profile picture
  googleId: { type: String, unique: true, required: false }, // Optional; only populated for Google users
});

export const User = model<IUser>('User', userSchema);
