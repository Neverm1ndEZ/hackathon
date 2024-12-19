// src/utils/logger.ts
// Logging utility using winston
import winston from "winston";

export const logger = winston.createLogger({
	level: process.env.NODE_ENV === "production" ? "info" : "debug",
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.json(),
	),
	transports: [
		new winston.transports.File({ filename: "logs/error.log", level: "error" }),
		new winston.transports.File({ filename: "logs/combined.log" }),
	],
});

// Add console transport for non-production environments
if (process.env.NODE_ENV !== "production") {
	logger.add(
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.colorize(),
				winston.format.simple(),
			),
		}),
	);
}
