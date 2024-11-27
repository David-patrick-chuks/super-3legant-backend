import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { MorganSetup } from "./config/morganSetup";
import dotenv from 'dotenv'; 
import helmet from 'helmet'; // For securing HTTP headers
import passport from 'passport';
import { corsOptions } from './config/cors';
import { connectDB } from './config/db';
import './config/passport';
import errorMiddleware from './middleware/errorMiddleware';
import { limiter } from './middleware/limiter';
import aiAgentRoutes from './routes/aiAgentRoutes';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import userRoutes from './routes/userRoutes';
import { healthcareService } from './services/HealthCheckController';
import { catchAll404Request } from './utils/catchAll404Request';
import { globalError } from './utils/globalErrorHandler';


dotenv.config();

const app: Application = express();

// Connect to the database
connectDB();


// Middleware setup
app.use(helmet()); // Security headers
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '1kb' }));
app.use(cookieParser());


// Stream Morgan logs to Winston
app.use(MorganSetup);




app.use('/api/', limiter);

// Initialize Passport for OAuth
app.use(passport.initialize());

// Route definitions
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chatbot', aiAgentRoutes);


// Health check route
app.get("/health", healthcareService);

// Catch-all 404 handler for undefined routes
app.use(catchAll404Request);

// Error handling middleware
app.use(errorMiddleware);

// Global error handler
app.use(globalError);

export default app;
