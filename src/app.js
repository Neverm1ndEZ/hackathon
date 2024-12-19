// src/app.ts
import { config } from "dotenv";
import express from "express";
import { createServer } from "http";
import Redis from "ioredis";
import mongoose from "mongoose";
import { Server } from "socket.io";
import { dbConfig } from "./config/database.js";
import { redisConfig } from "./config/redis.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { setupMiddleware } from "./middleware/setup.js";
import routes from "./routes/index.js";
import { setupSocketIO } from "./socket/setup.js";

// Initialize environment variables first
config();

// Create base Express application
const app = express();

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO with CORS configuration
const io = new Server(server, {
	cors: {
		origin: process.env.CORS_ORIGIN || "*",
		methods: ["GET", "POST"],
	},
});

// Initialize Redis client
const redis = new Redis(redisConfig);

// Initialize middleware
setupMiddleware(app);

// Initialize routes
app.use("/api", routes);

// Add health check endpoint
app.get("/health", (req, res) => {
	res.status(200).json({ status: "healthy" });
});

// Add error handling
app.use(errorHandler);

// Setup Socket.IO events
setupSocketIO(io);

// Database connection function
const connectToDatabase = async () => {
	try {
		await mongoose.connect(dbConfig.url, {
			serverSelectionTimeoutMS: 5000,
			socketTimeoutMS: 45000,
		});
		console.log("Connected to MongoDB successfully");
	} catch (error) {
		console.error("Database connection error:", error);
		process.exit(1);
	}
};

// Server startup function
const startServer = async () => {
	await connectToDatabase();

	const port = process.env.PORT || 8000;
	return server.listen(port, () => {
		console.log(`Server is running on port ${port}`);
		console.log(`Health check available at http://localhost:${port}/health`);
	});
};

// Export all necessary parts for testing and server startup
export { app, io, redis, server, startServer };
