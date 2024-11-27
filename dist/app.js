"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const morganSetup_1 = require("./config/morganSetup");
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet")); // For securing HTTP headers
const passport_1 = __importDefault(require("passport"));
const cors_2 = require("./config/cors");
const db_1 = require("./config/db");
require("./config/passport");
const errorMiddleware_1 = __importDefault(require("./middleware/errorMiddleware"));
const limiter_1 = require("./middleware/limiter");
const aiAgentRoutes_1 = __importDefault(require("./routes/aiAgentRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const HealthCheckController_1 = require("./services/HealthCheckController");
const catchAll404Request_1 = require("./utils/catchAll404Request");
const globalErrorHandler_1 = require("./utils/globalErrorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Connect to the database
(0, db_1.connectDB)();
// Middleware setup
app.use((0, helmet_1.default)()); // Security headers
app.use((0, cors_1.default)(cors_2.corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true, limit: '1kb' }));
app.use((0, cookie_parser_1.default)());
// Stream Morgan logs to Winston
app.use(morganSetup_1.MorganSetup);
app.use('/api/', limiter_1.limiter);
// Initialize Passport for OAuth
app.use(passport_1.default.initialize());
// Route definitions
app.use('/api/auth', authRoutes_1.default);
app.use('/api/products', productRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/chatbot', aiAgentRoutes_1.default);
// Health check route
app.get("/health", HealthCheckController_1.healthcareService);
// Catch-all 404 handler for undefined routes
app.use(catchAll404Request_1.catchAll404Request);
// Error handling middleware
app.use(errorMiddleware_1.default);
// Global error handler
app.use(globalErrorHandler_1.globalError);
exports.default = app;
