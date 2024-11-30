import mongoose from 'mongoose';
import logger from '../config/logger';  // Adjust the path according to your project structure

import dotenv from "dotenv";

dotenv.config();
// TypeScript explicitly types the function
/**
 * Delete a MongoDB database
 * @param uri - The MongoDB URI to connect to
 */
const deleteDatabase = async (uri: string): Promise<void> => {
  try {
    // Connect to the database
    await mongoose.connect(uri);

    const dbName = mongoose.connection.name;
    logger.info(`Connected to MongoDB database: ${dbName}`);

    // Delete the database
    await mongoose.connection.dropDatabase();
    logger.info(`Database ${dbName} deleted successfully.`);
  } catch (error) {
    logger.error('Error deleting database:', error);
  } finally {
    // Close the connection
    await mongoose.disconnect();
  }
};

// Make sure you have a valid URI before calling the function
const uri = String(process.env.MONGODB_URI_3);

deleteDatabase(uri)
