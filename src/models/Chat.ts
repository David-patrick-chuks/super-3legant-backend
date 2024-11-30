import { Schema, model, Document, Types } from 'mongoose';

import { connections } from '../config/db'; // Adjust the import according to your project structure

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

// Function to save chat to a specific MongoDB cluster
export const saveChatToCluster = async (data: any, clusterName: string) => {
  try {
    const connection = connections[clusterName]; // Use the connection for the specific cluster
    if (!connection) {
      throw new Error(`No MongoDB connection found for ${clusterName}`);
    }

    // Create the model using the selected connection
    const ChatModel = connection.model<IChat>('Chat', chatSchema);

    // Save the chat data
    const chat = new ChatModel(data);
    await chat.save();
    console.log(`Chat saved to ${clusterName}`);
  } catch (error) {
    console.error(`Error saving chat to ${clusterName}:`, error);
  }
};
