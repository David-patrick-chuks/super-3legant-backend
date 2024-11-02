import { Schema, model, Document, Types } from 'mongoose';

// Define the interface for the Chat document
export interface IChat extends Document {
  userId: Types.ObjectId; // ID of the user involved in the chat
  agentId: Types.ObjectId; // ID of the AI agent the chat is with
  messages: {
    sender: 'user' | 'agent';
    content: string;
    timestamp: Date;
  }[];
}

// Create the chat schema
const chatSchema = new Schema<IChat>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  agentId: { type: Schema.Types.ObjectId, ref: 'AIAgent', required: true },
  messages: [{
    sender: { type: String, enum: ['user', 'agent'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }]
});

// Create and export the Chat model
export const Chat = model<IChat>('Chat', chatSchema);
