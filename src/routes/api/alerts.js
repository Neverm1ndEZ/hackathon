// src/routes/api/alerts.ts
import { Router } from "express";
import { io } from "socket.io-client";
import { AlertController } from "../../controllers/AlertController.js";
import { authMiddleware } from "../../middleware/auth.js";
import { rateLimiter } from "../../middleware/rateLimiter.js";
import { validate } from "../../middleware/validation.js";
import { AlertService } from "../../services/AlertService.js";
import { MeshNetwork } from "../../services/mesh/MeshNetwork.js";

const router = Router();
const socket = io();
const meshNetwork = new MeshNetwork(socket);
const alertService = new AlertService(meshNetwork, socket);
const alertController = new AlertController(alertService);

router
	.route("/")
	.post(
		authMiddleware,
		validate("createAlert"),
		rateLimiter,
		alertController.createAlert,
	);

router
	.route("/:alertId/respond")
	.post(
		authMiddleware,
		validate("respondToAlert"),
		rateLimiter,
		alertController.respondToAlert,
	);

router
	.route("/:alertId/resolve")
	.post(
		authMiddleware,
		validate("resolveAlert"),
		rateLimiter,
		alertController.resolveAlert,
	);

export { router as alertRoutes };
