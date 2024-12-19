// src/routes/api/users.ts
import { Router } from "express";
import { UserController } from "../../controllers/UserController.js";
import { UserService } from "../../services/UserService.js";
import { authMiddleware } from "../../middleware/auth.js";
import { validate } from "../../middleware/validation.js";
import { rateLimiter } from "../../middleware/rateLimiter.js";

const router = Router();
const userService = new UserService(null);
const userController = new UserController(userService);

router.post(
	"/register",
	validate("registerUser"),
	rateLimiter,
	userController.registerUser,
);

router.post(
	"/login",
	validate("authenticateUser"),
	rateLimiter,
	userController.authenticateUser,
);

router
	.route("/skills")
	.put(
		authMiddleware,
		validate("updateUserSkills"),
		rateLimiter,
		userController.updateUserSkills,
	)
	.get(
		validate("findNearbySkills"),
		rateLimiter,
		userController.findNearbySkills,
	);

export { router as userRoutes };
