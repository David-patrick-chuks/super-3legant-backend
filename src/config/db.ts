import mongoose from 'mongoose';
import logger from './logger';

const clusterUris = [
  process.env.MONGODB_URI_1, 
  process.env.MONGODB_URI_2, // Cluster 2
  process.env.MONGODB_URI_3, // Cluster 3
  process.env.MONGODB_URI_4, // Cluster 4
  process.env.MONGODB_URI_5, // Cluster 5
];

export const connections: Record<string, mongoose.Connection> = {};

export const connectDB = async () => {
  try {
    for (let i = 0; i < clusterUris.length; i++) {
      const uri = clusterUris[i];
      if (!uri) {
        throw new Error(`MONGODB_URI_${i + 1} is not defined`);
      }

      const connectionName = `cluster${i + 1}`;
      const connection = await mongoose.createConnection(uri, {
        
      });

      connections[connectionName] = connection;
      logger.info(`MongoDB connected: ${connectionName}`);
    }
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1); // Exit process with failure
  }
};
