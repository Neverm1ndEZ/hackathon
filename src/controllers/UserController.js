export class UserController {
	constructor(userService) {
		// Store the userService as a class property
		this.userService = userService;

		// Bind class methods to ensure correct 'this' context
		this.registerUser = this.registerUser.bind(this);
		this.authenticateUser = this.authenticateUser.bind(this);
		this.updateUserSkills = this.updateUserSkills.bind(this);
		this.findNearbySkills = this.findNearbySkills.bind(this);
	}

	// Register new user
	async registerUser(req, res, next) {
		try {
			// If skills are provided as objects, extract just the names
			if (req.body.skills) {
				req.body.skills = req.body.skills.map((skill) =>
					// Handle both string and object formats
					typeof skill === "string" ? skill : skill.name,
				);
			}

			const { user, token } = await this.userService.registerUser(req.body);

			res.status(201).json({
				success: true,
				data: { user, token },
			});
		} catch (error) {
			next(error);
		}
	}

	// Authenticate user
	async authenticateUser(req, res, next) {
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
	}

	// Update user skills
	async updateUserSkills(req, res, next) {
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
	}

	// Find users with specific skills
	async findNearbySkills(req, res, next) {
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
	}
}
