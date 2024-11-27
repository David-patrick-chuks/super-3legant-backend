"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("./config/logger"));
const shutdown_1 = require("./services/shutdown");
dotenv_1.default.config();
const server = app_1.default.listen(process.env.PORT || 3000, () => {
    logger_1.default.info(`Server is running on port ${process.env.PORT || 3000}`);
});
process.on("SIGTERM", () => {
    logger_1.default.info("Received SIGTERM signal.");
    (0, shutdown_1.shutdown)(server);
});
process.on("SIGINT", () => {
    logger_1.default.info("Received SIGINT signal.");
    (0, shutdown_1.shutdown)(server);
});
