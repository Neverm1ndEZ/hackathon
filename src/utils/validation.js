// src/utils/validation.ts
// Validation schemas using Joi
import Joi from "joi";
import { APP_CONSTANTS } from "../config/constants.js";

export const validationSchemas = {
	createResource: Joi.object({
		name: Joi.string().required(),
		type: Joi.string()
			.valid(...APP_CONSTANTS.RESOURCE.TYPES)
			.required(),
		quantity: Joi.number().min(0).required(),
		location: Joi.object({
			type: Joi.string().valid("Point").required(),
			coordinates: Joi.array().items(Joi.number()).length(2).required(),
			// Continuing src/utils/validation.ts
		}),
		status: Joi.string()
			.valid(...APP_CONSTANTS.RESOURCE.STATUS)
			.required(),
		description: Joi.string().max(500),
		expiryDate: Joi.date().greater("now"),
		contactInfo: Joi.string().max(200),
	}),

	updateResourceStatus: Joi.object({
		status: Joi.string()
			.valid(...APP_CONSTANTS.RESOURCE.STATUS)
			.required(),
		quantity: Joi.number().min(0).required(),
	}),

	registerUser: Joi.object({
		username: Joi.string()
			.min(APP_CONSTANTS.VALIDATION.USERNAME_MIN_LENGTH)
			.max(APP_CONSTANTS.VALIDATION.USERNAME_MAX_LENGTH)
			.required(),
		email: Joi.string().email().required(),
		password: Joi.string()
			.min(APP_CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH)
			.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/)
			.required()
			.messages({
				"string.pattern.base":
					"Password must contain at least one letter and one number",
			}),
		skills: Joi.array()
			.items(
				Joi.object({
					name: Joi.string().required(),
					level: Joi.string()
						.valid("BEGINNER", "INTERMEDIATE", "EXPERT")
						.required(),
				}),
			)
			.max(APP_CONSTANTS.VALIDATION.MAX_SKILLS),
		location: Joi.object({
			type: Joi.string().valid("Point").required(),
			coordinates: Joi.array().items(Joi.number()).length(2).required(),
		}),
	}),

	authenticateUser: Joi.object({
		email: Joi.string().email().required(),
		password: Joi.string().required(),
	}),

	createAlert: Joi.object({
		type: Joi.string()
			.valid(...APP_CONSTANTS.ALERT.TYPES)
			.required(),
		priority: Joi.string()
			.valid(...APP_CONSTANTS.ALERT.PRIORITIES)
			.required(),
		location: Joi.object({
			type: Joi.string().valid("Point").required(),
			coordinates: Joi.array().items(Joi.number()).length(2).required(),
		}),
		description: Joi.string()
			.max(APP_CONSTANTS.VALIDATION.MAX_DESCRIPTION_LENGTH)
			.required(),
	}),

	respondToAlert: Joi.object({
		message: Joi.string()
			.max(APP_CONSTANTS.VALIDATION.MAX_DESCRIPTION_LENGTH)
			.required(),
	}),

	createArticle: Joi.object({
		title: Joi.string().required(),
		category: Joi.string()
			.valid(
				"FIRST_AID",
				"DISASTER_RESPONSE",
				"SURVIVAL",
				"TECHNICAL",
				"GENERAL",
			)
			.required(),
		content: Joi.string().required(),
		tags: Joi.array().items(Joi.string()).max(10),
		language: Joi.string().default("en"),
		region: Joi.array().items(Joi.string()),
		offline: Joi.boolean().default(false),
		priority: Joi.number().min(0).max(100).default(0),
	}),
};
