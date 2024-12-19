// src/middleware/validation.ts
// Request validation middleware using Joi
import { validationSchemas } from "../utils/validation.js";

export const validate = (schemaName) => {
	return (req, res, next) => {
		const schema = validationSchemas[schemaName];

		if (!schema) {
			throw new Error(`Validation schema '${schemaName}' not found`);
		}

		const { error } = schema.validate(req.body, {
			abortEarly: false,
			stripUnknown: true,
		});

		if (error) {
			res.status(400).json({
				success: false,
				error: "Validation error",
				details: error.details.map((detail) => ({
					message: detail.message,
					path: detail.path,
				})),
			});
			return;
		}

		next();
	};
};
