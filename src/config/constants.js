// src/config/constants.js
// Application-wide constants and configurations
export const APP_CONSTANTS = {
	// Application settings
	APP: {
		NAME: "CommunityShield",
		VERSION: "1.0.0",
		ENV: process.env.NODE_ENV || "development",
		PORT: process.env.PORT || 3000,
		API_PREFIX: "/api/v1",
	},

	// Authentication settings
	AUTH: {
		JWT_SECRET: process.env.JWT_SECRET || "your-secret-key",
		JWT_EXPIRES_IN: "24h",
		SALT_ROUNDS: 10,
	},

	// Resource types and statuses
	RESOURCE: {
		TYPES: ["WATER", "MEDICAL", "SHELTER", "FOOD", "OTHER"],
		STATUS: ["AVAILABLE", "LOW", "DEPLETED"],
		MAX_DISTANCE: 5000, // Maximum search radius in meters
	},

	// Alert priorities and types
	ALERT: {
		PRIORITIES: ["HIGH", "MEDIUM", "LOW"],
		TYPES: ["EMERGENCY", "MEDICAL", "EVACUATION", "SUPPLY"],
		EXPIRY: {
			HIGH: 3600, // 1 hour
			MEDIUM: 7200, // 2 hours
			LOW: 14400, // 4 hours
		},
	},

	// Mesh network configuration
	MESH: {
		MAX_PEERS: 10,
		PING_INTERVAL: 30000,
		RECONNECT_INTERVAL: 5000,
		MESSAGE_TTL: 3600,
	},

	// Rate limiting settings
	RATE_LIMIT: {
		WINDOW_MS: 15 * 60 * 1000, // 15 minutes
		MAX_REQUESTS: 100,
	},

	// Cache settings
	CACHE: {
		DEFAULT_TTL: 3600,
		RESOURCE_TTL: 1800,
		ALERT_TTL: 300,
		KNOWLEDGE_TTL: 86400,
	},

	// Validation constants
	VALIDATION: {
		PASSWORD_MIN_LENGTH: 8,
		USERNAME_MIN_LENGTH: 3,
		USERNAME_MAX_LENGTH: 30,
		MAX_SKILLS: 10,
		MAX_DESCRIPTION_LENGTH: 500,
	},

	// Error messages
	ERRORS: {
		INVALID_CREDENTIALS: "Invalid credentials",
		USER_NOT_FOUND: "User not found",
		RESOURCE_NOT_FOUND: "Resource not found",
		UNAUTHORIZED: "Unauthorized access",
		VALIDATION_ERROR: "Validation error",
		INTERNAL_ERROR: "Internal server error",
	},
};
