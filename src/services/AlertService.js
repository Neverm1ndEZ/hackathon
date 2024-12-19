// src/services/AlertService.js
import { User } from "../models/User.js";
import { EmergencyAlert } from "../models/EmergencyAlert.js";

export class AlertService {
	constructor(meshNetwork, io) {
		if (!io) {
			throw new Error("Socket.IO instance is required");
		}
		this.meshNetwork = meshNetwork;
		this.io = io;
	}

	// Create emergency alert
	async createAlert(alertData) {
		const alert = new EmergencyAlert(alertData);
		await alert.save();

		// Broadcast alert to nearby users
		await this.broadcastAlert(alert);

		return alert;
	}

	// Broadcast alert to online and offline users
	async broadcastAlert(alert) {
		try {
			// Find users within alert radius (5km)
			const nearbyUsers = await User.find({
				location: {
					$near: {
						$geometry: alert.location,
						$maxDistance: 5000, // 5km radius
					},
				},
			}).select("_id");

			// Prepare alert data
			const alertData = {
				id: alert._id,
				type: alert.type,
				priority: alert.priority,
				location: alert.location,
				description: alert.description,
				timestamp: new Date(),
			};

			// Broadcast to all connected clients in range
			const userRooms = nearbyUsers.map((user) => user._id.toString());

			// Broadcast to each user individually if multiple rooms aren't working
			for (const roomId of userRooms) {
				this.io.to(roomId).emit("emergency:alert", alertData);
			}

			// Also broadcast to a general emergency channel
			this.io.emit("emergency:broadcast", alertData);

			// Broadcast through mesh network for offline users
			if (this.meshNetwork) {
				this.meshNetwork.broadcastMessage(
					{
						type: "EMERGENCY_ALERT",
						data: alertData,
					},
					alert.createdBy?.toString(),
				);
			}

			console.log(`Alert broadcasted to ${userRooms.length} users`);
			return true;
		} catch (error) {
			console.error("Error broadcasting alert:", error);
			// Don't throw the error - we want the alert to be saved even if broadcasting fails
			return false;
		}
	}

	// Respond to alert
	async respondToAlert(alertId, userId, message) {
		const alert = await EmergencyAlert.findById(alertId);
		if (!alert) {
			throw new Error("Alert not found");
		}

		// Add response to alert
		alert.responses.push({
			user: userId,
			message,
			timestamp: new Date(),
		});

		await alert.save();

		// Notify alert creator
		this.io.to(alert.createdBy.toString()).emit("alert:response", {
			alertId,
			response: {
				user: userId,
				message,
				timestamp: new Date(),
			},
		});

		return alert;
	}

	// Resolve an alert
	async resolveAlert(alertId, resolvedBy) {
		const alert = await EmergencyAlert.findByIdAndUpdate(
			alertId,
			{
				status: "RESOLVED",
				resolvedBy,
				resolvedAt: new Date(),
			},
			{ new: true },
		);

		if (!alert) {
			throw new Error("Alert not found");
		}

		// Notify relevant users about resolution
		this.io.to(alert.createdBy.toString()).emit("alert:resolved", {
			alertId,
			resolvedBy,
			resolvedAt: new Date(),
		});

		return alert;
	}

	// Clean up expired alerts
	async cleanupExpiredAlerts() {
		const expiredAlerts = await EmergencyAlert.find({
			status: "ACTIVE",
			createdAt: {
				$lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours
			},
		});

		for (const alert of expiredAlerts) {
			alert.status = "EXPIRED";
			await alert.save();

			// Notify relevant users
			this.io.to(alert.createdBy.toString()).emit("alert:expired", {
				alertId: alert._id,
			});
		}
	}
}
