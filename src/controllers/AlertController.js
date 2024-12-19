// src/controllers/AlertController.js

export class AlertController {
	constructor(alertService) {
		this.alertService = alertService;
	}

	// Create emergency alert
	createAlert = async (req, res, next) => {
		try {
			const alert = await this.alertService.createAlert({
				...req.body,
				createdBy: req.user.id,
			});

			res.status(201).json({
				success: true,
				data: alert,
			});
		} catch (error) {
			next(error);
		}
	};

	// Respond to alert
	respondToAlert = async (req, res, next) => {
		try {
			const { alertId } = req.params;
			const { message } = req.body;

			const alert = await this.alertService.respondToAlert(
				alertId,
				req.user.id,
				message,
			);

			res.status(200).json({
				success: true,
				data: alert,
			});
		} catch (error) {
			next(error);
		}
	};

	// Resolve alert
	resolveAlert = async (req, res, next) => {
		try {
			const { alertId } = req.params;

			const alert = await this.alertService.resolveAlert(alertId, req.user.id);

			res.status(200).json({
				success: true,
				data: alert,
			});
		} catch (error) {
			next(error);
		}
	};
}
