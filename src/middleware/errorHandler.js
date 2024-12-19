// src/middleware/errorHandler.ts
// Global error handling middleware
import { logger } from "../utils/logger.js";

export class AppError extends Error {
	constructor(statusCode, message, isOperational = true) {
		super(message);
		this.statusCode = statusCode;
		this.message = message;
		this.isOperational = isOperational;
		Error.captureStackTrace(this, this.constructor);
	}
}

export const errorHandler = (error, req, res, next) => {
	if (error instanceof AppError) {
		// Handle operational errors
		logger.warn({
			message: error.message,
			statusCode: error.statusCode,
			path: req.path,
			method: req.method,
		});

		res.status(error.statusCode).json({
			success: false,
			error: error.message,
		});
	} else {
		// Handle programming or other unknown errors
		logger.error({
			message: error.message,
			stack: error.stack,
			path: req.path,
			method: req.method,
		});

		res.status(500).json({
			success: false,
			error: "Internal server error",
		});
	}
};
