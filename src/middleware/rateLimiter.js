// src/middleware/rateLimiter.js
// Rate limiting middleware using Redis
import { Redis } from "ioredis";
import { APP_CONSTANTS } from "../config/constants.js";

class RateLimiter {
	constructor(redis) {
		this.redis = redis;
	}

	limit = async (req, res, next) => {
		const key = this.getKey(req);

		try {
			// Get current count
			const current = await this.redis.incr(key);

			// Set expiry for new keys
			if (current === 1) {
				await this.redis.expire(key, APP_CONSTANTS.RATE_LIMIT.WINDOW_MS / 1000);
			}

			// Check if limit exceeded
			if (current > APP_CONSTANTS.RATE_LIMIT.MAX_REQUESTS) {
				res.status(429).json({
					success: false,
					error: "Too many requests, please try again later",
				});
				return;
			}

			next();
		} catch (error) {
			// If Redis fails, allow the request
			next();
		}
	};

	getKey(req) {
		// Use IP and route as key
		return `ratelimit:${req.ip}:${req.path}`;
	}
}

// Create rate limiter instance
const redis = new Redis(/* Redis config */);
export const rateLimiter = new RateLimiter(redis).limit;
