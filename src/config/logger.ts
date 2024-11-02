// logger.ts
import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console(), // Log to console
    new transports.File({ filename: 'combined.log' }), // Log to a file
    new transports.File({ filename: 'error.log', level: 'error' }), // Log errors to a separate file
  ],
});

export default logger;
