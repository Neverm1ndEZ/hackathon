// src/models/Resource.js
import mongoose from "mongoose";
import { APP_CONSTANTS } from "../config/constants.js";

// Create the schema for tracking emergency resources and supplies
const ResourceSchema = new mongoose.Schema(
	{
		// Basic resource information
		name: {
			type: String,
			required: true,
			trim: true,
		},

		// Resource category/type (e.g., MEDICAL_SUPPLIES, FOOD, WATER, SHELTER)
		type: {
			type: String,
			required: true,
			enum: APP_CONSTANTS.RESOURCE.TYPES,
			validate: {
				validator: function (value) {
					return APP_CONSTANTS.RESOURCE.TYPES.includes(value);
				},
				message: (props) => `${props.value} is not a valid resource type`,
			},
		},

		// Available quantity of the resource
		quantity: {
			type: Number,
			required: true,
			min: 0,
			validate: {
				validator: Number.isInteger,
				message: "{VALUE} is not an integer value",
			},
		},

		// Geographical location using GeoJSON Point format
		location: {
			type: {
				type: String,
				enum: ["Point"],
				required: true,
			},
			coordinates: {
				type: [Number],
				required: true,
				validate: {
					validator: function (coordinates) {
						return (
							coordinates.length === 2 &&
							coordinates[0] >= -180 &&
							coordinates[0] <= 180 &&
							coordinates[1] >= -90 &&
							coordinates[1] <= 90
						);
					},
					message: "Invalid coordinates. Must be [longitude, latitude]",
				},
			},
		},

		// Current availability status
		status: {
			type: String,
			required: true,
			enum: APP_CONSTANTS.RESOURCE.STATUS,
			default: "AVAILABLE",
		},

		// Timestamp of last inventory update
		lastUpdated: {
			type: Date,
			default: Date.now,
		},

		// Reference to user who last updated the resource
		updatedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},

		// Optional detailed description
		description: {
			type: String,
			maxLength: 1000,
		},

		// Expiration date for perishable resources
		expiryDate: {
			type: Date,
			validate: {
				validator: function (date) {
					return !date || date > new Date();
				},
				message: "Expiry date must be in the future",
			},
		},

		// Contact information for resource provider
		contactInfo: {
			type: String,
			validate: {
				validator: function (value) {
					return !value || value.length >= 10;
				},
				message: "Contact information must be at least 10 characters long",
			},
		},

		// Flexible field for additional resource data
		metadata: {
			type: Map,
			of: mongoose.Schema.Types.Mixed,
		},
	},
	{
		timestamps: true,
	},
);

// Create indexes for efficient querying
ResourceSchema.index({ location: "2dsphere" });
ResourceSchema.index({ type: 1, status: 1 });
ResourceSchema.index({ updatedBy: 1 });

// Pre-save middleware to update lastUpdated timestamp
ResourceSchema.pre("save", function (next) {
	this.lastUpdated = new Date();
	next();
});

// Static methods for common resource queries
ResourceSchema.statics = {
	// Find available resources within a radius
	async findNearby(coordinates, radiusInMeters, type = null) {
		const query = {
			status: "AVAILABLE",
			location: {
				$near: {
					$geometry: {
						type: "Point",
						coordinates: coordinates,
					},
					$maxDistance: radiusInMeters,
				},
			},
		};

		if (type) {
			query.type = type;
		}

		return this.find(query).populate("updatedBy", "name contact");
	},

	// Find resources that are running low (less than threshold)
	async findLowStock(threshold = 10) {
		return this.find({
			status: "AVAILABLE",
			quantity: { $lte: threshold },
		}).sort({ quantity: 1 });
	},

	// Find resources expiring soon
	async findExpiringResources(daysThreshold = 7) {
		const thresholdDate = new Date();
		thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

		return this.find({
			expiryDate: {
				$exists: true,
				$ne: null,
				$lte: thresholdDate,
			},
			status: "AVAILABLE",
		}).sort({ expiryDate: 1 });
	},
};

// Instance methods for resource operations
ResourceSchema.methods = {
	// Update resource quantity
	async updateQuantity(newQuantity, userId) {
		this.quantity = newQuantity;
		this.updatedBy = userId;
		return this.save();
	},

	// Mark resource as depleted
	async markDepleted(userId) {
		this.status = "DEPLETED";
		this.quantity = 0;
		this.updatedBy = userId;
		return this.save();
	},

	// Check if resource needs restocking
	needsRestocking(threshold = 10) {
		return this.status === "AVAILABLE" && this.quantity <= threshold;
	},
};

// Create and export the model
const Resource = mongoose.model("Resource", ResourceSchema);

export default Resource;
