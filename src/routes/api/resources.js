// src/routes/api/resources.ts
import { Router } from "express";
import { ResourceController } from "../../controllers/ResourceController.js";
import { ResourceService } from "../../services/ResourceService.js";
import { authMiddleware } from "../../middleware/auth.js";
import { validate } from "../../middleware/validation.js";
import { rateLimiter } from "../../middleware/rateLimiter.js";
import { createClient } from "redis";

const router = Router();
const redisClient = createClient();
const resourceService = new ResourceService(redisClient);
const resourceController = new ResourceController(resourceService);

router
	.route("/")
	.post(
		authMiddleware,
		validate("createResource"),
		rateLimiter,
		resourceController.createResource,
	)
	.get(
		validate("findNearbyResources"),
		rateLimiter,
		resourceController.findNearbyResources,
	);

router
	.route("/:id/status")
	.patch(
		authMiddleware,
		validate("updateResourceStatus"),
		rateLimiter,
		resourceController.updateResourceStatus,
	);

export { router as resourceRoutes };
