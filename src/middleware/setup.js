// src/middleware/setup.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";

export const setupMiddleware = (app) => {
	// Security middleware
	app.use(helmet());

	// CORS configuration
	app.use(
		cors({
			origin: process.env.CORS_ORIGIN || "*",
			methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
			credentials: true,
		}),
	);

	// Request processing middleware
	app.use(compression());
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));
};
