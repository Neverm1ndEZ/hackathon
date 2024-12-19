// src/controllers/UserController.ts

export class UserController {
	constructor(userService) {}

	// Register new user
	registerUser = async (req, res, next) => {
		try {
			const { user, token } = await this.userService.registerUser(req.body);

			res.status(201).json({
				success: true,
				data: { user, token },
			});
		} catch (error) {
			next(error);
		}
	};

	// Authenticate user
	authenticateUser = async (req, res, next) => {
		try {
			const { email, password } = req.body;
			const { user, token } = await this.userService.authenticateUser(
				email,
				password,
			);

			res.status(200).json({
				success: true,
				data: { user, token },
			});
		} catch (error) {
			next(error);
		}
	};

	// Update user skills
	updateUserSkills = async (req, res, next) => {
		try {
			const updatedUser = await this.userService.updateUserSkills(
				req.user.id,
				req.body.skills,
			);

			res.status(200).json({
				success: true,
				data: updatedUser,
			});
		} catch (error) {
			next(error);
		}
	};

	// Find users with specific skills
	findNearbySkills = async (req, res, next) => {
		try {
			const { latitude, longitude, skill, maxDistance } = req.query;

			const users = await this.userService.findNearbySkills(
				Number(latitude),
				Number(longitude),
				skill,
				maxDistance ? Number(maxDistance) : undefined,
			);

			res.status(200).json({
				success: true,
				data: users,
			});
		} catch (error) {
			next(error);
		}
	};
}
