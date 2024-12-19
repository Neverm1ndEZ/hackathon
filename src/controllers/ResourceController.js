// src/controllers/ResourceController.ts
import { ResourceService } from "../services/ResourceService.js";

export class ResourceController {
	constructor(resourceService) {}

	// Create new resource
	createResource = async (req, res, next) => {
		try {
			const resource = await this.resourceService.createResource({
				...req.body,
				updatedBy: req.user.id, // From auth middleware
			});

			res.status(201).json({
				success: true,
				data: resource,
			});
		} catch (error) {
			next(error);
		}
	};

	// Find nearby resources
	findNearbyResources = async (req, res, next) => {
		try {
			const { latitude, longitude, type, maxDistance } = req.query;

			const resources = await this.resourceService.findNearbyResources(
				Number(latitude),
				Number(longitude),
				{
					type: type,
					maxDistance: maxDistance ? Number(maxDistance) : undefined,
				},
			);

			res.status(200).json({
				success: true,
				data: resources,
			});
		} catch (error) {
			next(error);
		}
	};

	// Update resource status
	updateResourceStatus = async (req, res, next) => {
		try {
			const { id } = req.params;
			const { status, quantity } = req.body;

			const resource = await this.resourceService.updateResourceStatus(id, {
				status,
				quantity,
				updatedBy: req.user.id,
			});

			if (!resource) {
				res.status(404).json({
					success: false,
					error: "Resource not found",
				});
				return;
			}

			res.status(200).json({
				success: true,
				data: resource,
			});
		} catch (error) {
			next(error);
		}
	};
}
