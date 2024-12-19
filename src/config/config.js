// src/config/socket.ts
// Socket.IO configuration and event handling
import { Server } from "socket.io";

export const socketConfig = {
	cors: {
		origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
		methods: ["GET", "POST"],
		credentials: true,
	},
	pingTimeout: 30000,
	pingInterval: 25000,
	transports: ["websocket", "polling"],
};

export const initializeSocketIO = (httpServer) => {
	const io = new Server(httpServer, socketConfig);

	// Middleware for authentication
	io.use(async (socket, next) => {
		const token = socket.handshake.auth.token;
		if (!token) {
			return next(new Error("Authentication error"));
		}
		try {
			// Verify token and attach user data to socket
			// Implementation depends on your auth system
			next();
		} catch (error) {
			next(new Error("Authentication error"));
		}
	});

	return io;
};

// Socket event handlers
export const socketEvents = {
	RESOURCE_UPDATE: "resource:update",
	EMERGENCY_ALERT: "emergency:alert",
	MESH_MESSAGE: "mesh:message",
	USER_STATUS: "user:status",
	KNOWLEDGE_SYNC: "knowledge:sync",
};
