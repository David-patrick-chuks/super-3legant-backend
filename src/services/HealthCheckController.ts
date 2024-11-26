import { Response, Request } from "express";
import logger from "../config/logger";
import { checkDatabaseConnection } from "../utils/checkDatabaseConnection";

export const healthcareService = async (_req: Request, res: Response) => {
    try {
        // Check the database connection status
        await checkDatabaseConnection();
        res.status(200).json({ status: "UP!!, DB connection OK" });
    } catch (error: unknown) {
        if (error instanceof Error) {
            logger.error(error.message)
            res.status(500).json({ status: "DOWN", error: error.message });
        } else {
            logger.error("Unknown error occurred", error)
            res.status(500).json({ status: "DOWN", error: "Unknown error occurred" });
        }
    }
}