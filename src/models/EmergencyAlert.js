// src/models/EmergencyAlert.js
import mongoose from "mongoose";
import { APP_CONSTANTS } from "../config/constants.js";

// Create the schema for emergency alerts with detailed configuration
const EmergencyAlertSchema = new mongoose.Schema(
	{
		// Type of emergency (e.g., medical, fire, natural disaster)
		type: {
			type: String,
			required: true,
			enum: APP_CONSTANTS.ALERT.TYPES,
			// enum ensures the type is one of the predefined values in constants
		},

		// Priority level of the emergency
		priority: {
			type: String,
			required: true,
			enum: APP_CONSTANTS.ALERT.PRIORITIES,
			// enum ensures priority is one of: HIGH, MEDIUM, LOW, etc.
		},

		// Geographical location using GeoJSON Point format
		location: {
			type: {
				type: String,
				enum: ["Point"], // Only allow 'Point' geometry type
				required: true,
			},
			coordinates: {
				type: [Number], // Array of [longitude, latitude]
				required: true,
			},
		},

		// Detailed description of the emergency
		description: {
			type: String,
			required: true,
			maxlength: APP_CONSTANTS.VALIDATION.MAX_DESCRIPTION_LENGTH,
			// Ensures descriptions don't exceed maximum allowed length
		},

		// Reference to the user who created the alert
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User", // References the User model
			required: true,
		},

		// Current status of the emergency alert
		status: {
			type: String,
			enum: ["ACTIVE", "RESOLVED", "EXPIRED"],
			default: "ACTIVE",
		},

		// Reference to user who resolved the alert (optional)
		resolvedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},

		// Timestamp when the alert was resolved (optional)
		resolvedAt: Date,

		// Array of responses from users to this emergency
		responses: [
			{
				user: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
					required: true,
				},
				message: {
					type: String,
					required: true,
				},
				timestamp: {
					type: Date,
					default: Date.now,
				},
			},
		],

		// Flexible field for additional data
		metadata: {
			type: Map,
			of: mongoose.Schema.Types.Mixed,
			// Allows storing any additional information about the emergency
		},
	},
	{
		timestamps: true, // Automatically add createdAt and updatedAt timestamps
	},
);

// Create indexes to optimize query performance

// Enable geospatial queries on location field
EmergencyAlertSchema.index({ location: "2dsphere" });

// Optimize queries for finding active alerts by priority
EmergencyAlertSchema.index({ status: 1, priority: 1 });

// Optimize queries for finding alerts by creator
EmergencyAlertSchema.index({ createdBy: 1 });

// Middleware to automatically set resolvedAt timestamp
EmergencyAlertSchema.pre("save", function (next) {
	// If the status is being changed to RESOLVED
	if (this.isModified("status") && this.status === "RESOLVED") {
		this.resolvedAt = new Date();
	}
	next();
});

// Static methods for common queries
EmergencyAlertSchema.statics = {
	// Find active alerts within a certain radius (in meters) of a point
	async findNearby(coordinates, radiusInMeters) {
		return this.find({
			status: "ACTIVE",
			location: {
				$near: {
					$geometry: {
						type: "Point",
						coordinates: coordinates,
					},
					$maxDistance: radiusInMeters,
				},
			},
		});
	},

	// Find all active alerts of a specific priority
	async findActiveByPriority(priority) {
		return this.find({
			status: "ACTIVE",
			priority: priority,
		}).populate("createdBy", "name contact");
	},
};

// Instance methods for alert operations
EmergencyAlertSchema.methods = {
	// Add a response to the alert
	async addResponse(userId, message) {
		this.responses.push({
			user: userId,
			message: message,
			timestamp: new Date(),
		});
		return this.save();
	},

	// Resolve the alert
	async resolve(resolvingUserId) {
		this.status = "RESOLVED";
		this.resolvedBy = resolvingUserId;
		this.resolvedAt = new Date();
		return this.save();
	},
};

// Create and export the model
export const EmergencyAlert = mongoose.model(
	"EmergencyAlert",
	EmergencyAlertSchema,
);
