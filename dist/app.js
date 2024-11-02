"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const passport_1 = __importDefault(require("passport"));
const db_1 = require("./config/db");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const aiAgentRoutes_1 = __importDefault(require("./routes/aiAgentRoutes"));
const errorMiddleware_1 = __importDefault(require("./middleware/errorMiddleware"));
require("./config/passport"); // Import Passport configuration to initialize Google OAuth
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan")); // For logging requests
const helmet_1 = __importDefault(require("helmet")); // For securing HTTP headers
const express_rate_limit_1 = __importDefault(require("express-rate-limit")); // For limiting requests
dotenv_1.default.config();
const app = (0, express_1.default)();
// Connect to the database
(0, db_1.connectDB)();
// CORS configuration
const corsOptions = {
    origin: process.env.CORS_ORIGIN || '*', // Allow requests from specified origin or all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    preflightContinue: false, // Pass the CORS preflight response to the next handler
};
// Middleware setup
app.use((0, helmet_1.default)()); // Protect against well-known vulnerabilities
app.use((0, cors_1.default)(corsOptions)); // Use the configured CORS options
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)('combined')); // Log requests to the console
// Rate limiting middleware
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter); // Apply to all API routes
// Initialize Passport for OAuth
app.use(passport_1.default.initialize());
// Route definitions
app.use('/api/auth', authRoutes_1.default); // Authentication routes
app.use('/api/products', productRoutes_1.default); // Product management routes
app.use('/api/users', userRoutes_1.default); // User management routes
app.use('/api/chatbot', aiAgentRoutes_1.default); // User management routes
// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP' });
});
// Error handling middleware
app.use(errorMiddleware_1.default);
// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Internal Server Error',
    });
});
exports.default = app;
