import express, { Application } from 'express';
import cors from 'cors';
import passport from 'passport'; // Import Passport
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import userRoutes from './routes/userRoutes';
import errorMiddleware from './middleware/errorMiddleware';
import './config/passport'; // Import Passport configuration to initialize Google OAuth
import dotenv from 'dotenv';


const app: Application = express();
dotenv.config();

// Connect to the database
connectDB();

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize()); // Initialize Passport for OAuth

// Route definitions
app.use('/api/auth', authRoutes); // Authentication routes
app.use('/api/products', productRoutes); // Product management routes
app.use('/api/users', userRoutes); // User management routes

// Error handling middleware
app.use(errorMiddleware);

export default app;
