// src/middleware/auth.js
// Authentication middleware using JWT
import jwt from "jsonwebtoken";
import { APP_CONSTANTS } from "../config/constants.js";
import { User } from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
	try {
		const token = req.header("Authorization")?.replace("Bearer ", "");

		if (!token) {
			res.status(401).json({
				success: false,
				error: "Authentication required",
			});
			return;
		}

		// Verify token
		const decoded = jwt.verify(token, APP_CONSTANTS.AUTH.JWT_SECRET);

		// Get user from database
		const user = await User.findById(decoded.userId).select("-password");

		if (!user) {
			res.status(401).json({
				success: false,
				error: "User not found",
			});
			return;
		}

		// Attach user to request object
		req.user = user;
		next();
	} catch (error) {
		res.status(401).json({
			success: false,
			error: "Invalid authentication token",
		});
	}
};
