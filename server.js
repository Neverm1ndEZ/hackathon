// src/server.ts
import { startServer } from "./src/app.js";

// Start the server and handle any errors
startServer().catch((error) => {
	console.error("Failed to start server:", error);
	process.exit(1);
});
