"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const passport_1 = __importDefault(require("passport"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const aiAgentRoutes_1 = __importDefault(require("./routes/aiAgentRoutes"));
const errorMiddleware_1 = __importDefault(require("./middleware/errorMiddleware"));
require("./config/passport");
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan")); // For logging requests
const helmet_1 = __importDefault(require("helmet")); // For securing HTTP headers
const express_rate_limit_1 = __importDefault(require("express-rate-limit")); // For limiting requests
const logger_1 = __importDefault(require("./config/logger"));
dotenv_1.default.config();
const app = (0, express_1.default)();
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
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Setup Morgan to log requests
app.use((0, morgan_1.default)('combined', {
    stream: {
        write: (message) => logger_1.default.info(message.trim()), // Stream Morgan logs to Winston
    },
}));
// Rate limiting middleware
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);
// Initialize Passport for OAuth
app.use(passport_1.default.initialize());
// Route definitions
app.use('/api/auth', authRoutes_1.default);
app.use('/api/products', productRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/chatbot', aiAgentRoutes_1.default);
// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP' });
});
// Error handling middleware
app.use(errorMiddleware_1.default);
// Global error handler
app.use((err, req, res, next) => {
    logger_1.default.error(err.stack); // Log the error with Winston
    res.status(500).json({
        message: 'Internal Server Error',
    });
});
exports.default = app;
