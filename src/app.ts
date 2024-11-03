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
import './config/passport';
import dotenv from 'dotenv';
import morgan from 'morgan'; // For logging requests
import helmet from 'helmet'; // For securing HTTP headers
import rateLimit from 'express-rate-limit'; // For limiting requests
import logger from './config/logger';


dotenv.config();

const app: Application = express();

// Connect to the database
// connectDB();

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
};

// Middleware setup
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Setup Morgan to log requests
app.use(morgan('combined', {
  stream: {
    write: (message : string) => logger.info(message.trim()), // Stream Morgan logs to Winston
  },
}));

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Initialize Passport for OAuth
app.use(passport.initialize());

// Route definitions
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chatbot', aiAgentRoutes);

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP' });
});

// Error handling middleware
app.use(errorMiddleware);

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.stack); // Log the error with Winston
  res.status(500).json({
    message: 'Internal Server Error',
  });
});

export default app;
