// src/services/UserService.js
// Handles user management, authentication, and skill registry
import pkg from "jsonwebtoken";
const { sign } = pkg;
import { APP_CONSTANTS } from "../config/constants.js";
import { User } from "../models/User.js";

export class UserService {
	constructor(redis) {
		this.redis = redis;
		// Flag to track if Redis caching is available
		this.hasCaching = Boolean(redis);
	}

	async registerUser(userData) {
		// Validate unique email and username
		const existingUser = await User.findOne({
			$or: [{ email: userData.email }, { username: userData.username }],
		});

		if (existingUser) {
			throw new Error("Email or username already exists");
		}

		// Create new user
		const user = new User(userData);
		await user.save();

		// Generate authentication token
		const token = this.generateAuthToken(user);

		// Try to cache user data, but don't let caching failures affect registration
		try {
			await this.cacheUserData(user);
		} catch (error) {
			console.warn("Failed to cache user data:", error.message);
		}

		return {
			user: this.sanitizeUser(user),
			token,
		};
	}

	async authenticateUser(email, password) {
		const user = await User.findOne({ email });
		if (!user) {
			throw new Error("Invalid credentials");
		}

		const isValidPassword = await user.comparePassword(password);
		if (!isValidPassword) {
			throw new Error("Invalid credentials");
		}

		const token = this.generateAuthToken(user);

		// Update last active timestamp
		user.lastActive = new Date();
		await user.save();

		return {
			user: this.sanitizeUser(user),
			token,
		};
	}

	// Register or update user skills
	async updateUserSkills(userId, skills) {
		// Validate skills count
		if (skills.length > APP_CONSTANTS.VALIDATION.MAX_SKILLS) {
			throw new Error(
				`Maximum ${APP_CONSTANTS.VALIDATION.MAX_SKILLS} skills allowed`,
			);
		}

		const user = await User.findByIdAndUpdate(
			userId,
			{ $set: { skills } },
			{ new: true },
		);

		if (!user) {
			throw new Error("User not found");
		}

		// Update cache
		await this.cacheUserData(user);

		return user;
	}

	// Find users with specific skills near a location
	async findNearbySkills(latitude, longitude, skillName, maxDistance = 5000) {
		const query = {
			location: {
				$near: {
					$geometry: {
						type: "Point",
						coordinates: [longitude, latitude],
					},
					$maxDistance: maxDistance,
				},
			},
			status: "ONLINE",
		};

		if (skillName) {
			query["skills.name"] = skillName;
		}

		return User.find(query).select("-password").exec();
	}

	// Update user's online status
	async updateUserStatus(userId, status) {
		await User.findByIdAndUpdate(userId, {
			status,
			lastActive: new Date(),
		});

		// Update cache
		await this.redis.hset(
			`user:${userId}:status`,
			"status",
			status,
			"lastActive",
			Date.now().toString(),
		);
	}

	generateAuthToken(user) {
		return sign({ userId: user._id }, APP_CONSTANTS.AUTH.JWT_SECRET, {
			expiresIn: APP_CONSTANTS.AUTH.JWT_EXPIRES_IN,
		});
	}

	async cacheUserData(user) {
		// Skip caching if Redis isn't available
		if (!this.hasCaching) {
			return;
		}

		const userData = this.sanitizeUser(user);
		try {
			await this.redis.setex(
				`user:${user._id}`,
				APP_CONSTANTS.CACHE.DEFAULT_TTL,
				JSON.stringify(userData),
			);
		} catch (error) {
			// Log the error but don't let it break the application
			console.warn("Redis caching failed:", error.message);
		}
	}

	sanitizeUser(user) {
		const { password, ...userData } = user.toObject();
		return userData;
	}
}
