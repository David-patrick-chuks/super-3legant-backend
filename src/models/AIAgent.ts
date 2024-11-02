import { Schema, model, Document, Types } from 'mongoose';

export interface IAIAgent extends Document {
  creator: Types.ObjectId; // User ID of the creator
  name: string; // Name of the AI Agent
  agentId: string; // Unique identifier for the agent
  username: string; // AI Agent's username
  title: string; // Title for the AI Agent
  description: string; // Description of the AI Agent
  vibeResponse: 'friendly' | 'neutral' | 'professional'; // Response tonality
  profileAvatar?: string; // Profile picture URL
  displayName: string; // Display name of the AI Agent
  colors: string[]; // Custom colors for the agent
  startingMessage: string; // The first message from the agent
  humanButtonMessage: string; // Text for the human response button
  placeholderMessage: string; // Placeholder text in the input box
  requestMessage: string; // Text for sending a request
  suggestionsMessage: string[]; // Array of suggestion messages
  creatorEmail: string; // Creator's email
  thankMessage: string; // Thank you message
  trainingData: {
    links: string[];
    files: string[];
    textPrompts?: string[]; // Optional; added training data by text
    notionDocs?: string[]; // Optional; connected Notion document links
  };
  socialLinks?: {
    xProfile?: string;
    linkedInProfile?: string;
    facebookProfile?: string;
    redditProfile?: string;
  };
  remainingChars: number; // Remaining character quota
  leads?: {
    name: string;
    email: string;
    phone?: string;
  }[];
  threads?: {
    threadId: string;
    messages: {
      sender: 'user' | 'agent';
      content: string;
      timestamp: Date;
    }[];
  }[];
}

const aiAgentSchema = new Schema<IAIAgent>({
  creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  agentId: { type: String, unique: true, required: true },
  username: { type: String, required: true },
  title: { type: String },
  description: { type: String },
  vibeResponse: { type: String, enum: ['friendly', 'neutral', 'professional'], default: 'neutral' },
  profileAvatar: { type: String },
  displayName: { type: String },
  colors: [{ type: String }],
  startingMessage: { type: String },
  humanButtonMessage: { type: String },
  placeholderMessage: { type: String },
  requestMessage: { type: String },
  suggestionsMessage: [{ type: String }],
  creatorEmail: { type: String, required: true },
  thankMessage: { type: String },
  trainingData: {
    links: [{ type: String }],
    files: [{ type: String }],
    textPrompts: [{ type: String }],
    notionDocs: [{ type: String }]
  },
  socialLinks: {
    xProfile: { type: String },
    linkedInProfile: { type: String },
    facebookProfile: { type: String },
    redditProfile: { type: String }
  },
  remainingChars: { type: Number, default: 1000000 },
  leads: [{
    name: { type: String },
    email: { type: String },
    phone: { type: String }
  }],
  threads: [{
    threadId: { type: String },
    messages: [{
      sender: { type: String, enum: ['user', 'agent'], required: true },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }]
  }]
});

export const AIAgent = model<IAIAgent>('AIAgent', aiAgentSchema);
