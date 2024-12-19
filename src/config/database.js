import mongoose from "mongoose";

export const dbConfig = {
	url: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/communityshield",
	options: {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		// Set reasonable timeouts for operations
		serverSelectionTimeoutMS: 5000,
		socketTimeoutMS: 45000,
		// Enable automatic index creation
		autoIndex: process.env.NODE_ENV !== "production",
	},
};

// Database connection handler
export const connectDatabase = async () => {
	try {
		await mongoose.connect(dbConfig.url);
		console.log("Successfully connected to MongoDB");

		// Handle connection events
		mongoose.connection.on("error", (error) => {
			console.error("MongoDB connection error:", error);
		});

		mongoose.connection.on("disconnected", () => {
			console.warn("MongoDB disconnected. Attempting to reconnect...");
		});
	} catch (error) {
		console.error("Failed to connect to MongoDB:", error);
		process.exit(1);
	}
};
