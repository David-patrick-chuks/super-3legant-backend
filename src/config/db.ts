import mongoose from 'mongoose';
import logger from './logger';

export const connections: Record<string, mongoose.Connection> = {};

export const connectDB = async () => {
  const clusterUris = [
    String(process.env.MONGODB_URI_1),
    String(process.env.MONGODB_URI_2),
    String(process.env.MONGODB_URI_3),
    String(process.env.MONGODB_URI_4),
  ];

  try {
    for (let i = 0; i < clusterUris.length; i++) {
      const uri = clusterUris[i];

      if (!uri) {
        throw new Error(`MONGODB_URI_${i + 1} is not defined`);
      }

      const connectionName = `cluster${i + 1}`;

      // Log connecting to the database (without the URI)
      // logger.info(`Connecting to MongoDB Database: ${connectionName}`);

      // Validate the URI scheme
      if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
        throw new Error(`Invalid URI scheme for MONGODB_URI_${i + 1}. Expected "mongodb://" or "mongodb+srv://"`);
      }

      const connection = await mongoose.createConnection(uri, {
        // ssl: true, // Ensure SSL is enabled
        autoSelectFamily: false,
        // tlsAllowInvalidCertificates: false, // Optional: Set this to true if you have issues with certificates
      });

      connections[connectionName] = connection;

      // Log after successful connection (without the URI)
      logger.info(`MongoDB connected to database: ${connectionName}`);
    }
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1); // Exit process with failure
  }
};
