import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import userRoutes from './routes/userRoutes';
import aiAgentRoutes from './routes/aiAgentRoutes';
import errorMiddleware from './middleware/errorMiddleware';
import './config/passport'; // Import Passport configuration to initialize Google OAuth
import dotenv from 'dotenv';
import morgan from 'morgan'; // For logging requests
import helmet from 'helmet'; // For securing HTTP headers
import rateLimit from 'express-rate-limit'; // For limiting requests

dotenv.config();

const app: Application = express();

// Connect to the database
connectDB();

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*', // Allow requests from specified origin or all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  preflightContinue: false, // Pass the CORS preflight response to the next handler
};

// Middleware setup
app.use(helmet()); // Protect against well-known vulnerabilities
app.use(cors(corsOptions)); // Use the configured CORS options
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('combined')); // Log requests to the console

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter); // Apply to all API routes

// Initialize Passport for OAuth
app.use(passport.initialize());

// Route definitions
app.use('/api/auth', authRoutes); // Authentication routes
app.use('/api/products', productRoutes); // Product management routes
app.use('/api/users', userRoutes); // User management routes
app.use('/api/chatbot', aiAgentRoutes); // User management routes

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP' });
});

// Error handling middleware
app.use(errorMiddleware);

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
  });
});

export default app;
