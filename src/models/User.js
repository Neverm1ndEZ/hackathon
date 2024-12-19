// src/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true, // This automatically creates an index
			trim: true,
			minlength: 3,
			maxlength: 30,
		},
		email: {
			type: String,
			required: true,
			unique: true, // This automatically creates an index
			trim: true,
			lowercase: true,
		},
		password: {
			type: String,
			required: true,
			minlength: 8,
		},
		name: {
			type: String,
			required: true,
			trim: true,
		},
		skills: [
			{
				type: String,
				trim: true,
			},
		],
		location: {
			type: {
				type: String,
				enum: ["Point"],
				default: "Point",
			},
			coordinates: {
				type: [Number],
				required: true,
				validate: {
					validator: function (coords) {
						return (
							coords.length === 2 &&
							coords[0] >= -180 &&
							coords[0] <= 180 &&
							coords[1] >= -90 &&
							coords[1] <= 90
						);
					},
					message: "Invalid coordinates",
				},
			},
		},
		status: {
			type: String,
			enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
			default: "ACTIVE",
		},
		lastActive: {
			type: Date,
			default: Date.now,
		},
		role: {
			type: String,
			enum: ["USER", "MODERATOR", "ADMIN"],
			default: "USER",
		},
		preferences: {
			notifications: {
				type: Boolean,
				default: true,
			},
			radius: {
				type: Number,
				default: 5000, // 5km radius
				min: 100,
				max: 50000,
			},
		},
	},
	{
		timestamps: true,
	},
);

// Create compound indexes for efficient queries
UserSchema.index({ location: "2dsphere" }); // Geospatial index
UserSchema.index({ status: 1, role: 1 }); // Status and role lookup
UserSchema.index({ skills: 1 }); // Skills search

// Password hashing middleware
UserSchema.pre("save", async function (next) {
	// Only hash the password if it's been modified or is new
	if (!this.isModified("password")) return next();

	try {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error) {
		next(error);
	}
});

// Method to check password validity
UserSchema.methods.comparePassword = async function (candidatePassword) {
	try {
		return await bcrypt.compare(candidatePassword, this.password);
	} catch (error) {
		throw new Error("Password comparison failed");
	}
};

// Method to validate coordinates
UserSchema.methods.updateLocation = function (coordinates) {
	if (!Array.isArray(coordinates) || coordinates.length !== 2) {
		throw new Error("Coordinates must be an array of [longitude, latitude]");
	}

	this.location.coordinates = coordinates;
	return this.save();
};

// Method to update user skills
UserSchema.methods.updateSkills = function (skills) {
	this.skills = Array.from(new Set(skills)); // Remove duplicates
	return this.save();
};

// Static method to find users by skill
UserSchema.statics.findBySkill = function (skill, limit = 10) {
	return this.find({ skills: skill }).limit(limit).select("-password");
};

// Static method to find nearby users
UserSchema.statics.findNearby = function (coordinates, maxDistance = 5000) {
	return this.find({
		location: {
			$near: {
				$geometry: {
					type: "Point",
					coordinates: coordinates,
				},
				$maxDistance: maxDistance,
			},
		},
		status: "ACTIVE",
	}).select("-password");
};

export const User = mongoose.model("User", UserSchema);
