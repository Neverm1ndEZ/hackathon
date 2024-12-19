// src/config/redis.ts
// Redis configuration for caching and real-time features

export const redisConfig = {
	host: process.env.REDIS_HOST || "localhost",
	port: parseInt(process.env.REDIS_PORT || "6379"),
	password: process.env.REDIS_PASSWORD,
	retryStrategy: (times) => {
		// Exponential backoff for retry attempts
		const delay = Math.min(times * 50, 2000);
		return delay;
	},
	// Enable automatic error handling and reconnection
	reconnectOnError: (err) => {
		const targetError = "READONLY";
		if (err.message.includes(targetError)) {
			return true; // Reconnect for READONLY errors
		}
		return false;
	},
};

// Cache configuration settings
export const cacheConfig = {
	// Default TTL for cached items (in seconds)
	defaultTTL: 3600,
	// Prefix for cache keys to prevent collisions
	keyPrefix: "cs:",
	// Cache categories with specific TTLs
	ttls: {
		resources: 1800, // 30 minutes for resource data
		alerts: 300, // 5 minutes for alerts
		knowledge: 86400, // 24 hours for knowledge base
	},
};
