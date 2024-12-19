// src/services/ResourceService.js
import { EventEmitter } from "events";
import Resource from "../models/Resource.js"; // Changed to import default
import { APP_CONSTANTS } from "../config/constants.js";

export class ResourceService extends EventEmitter {
	/**
	 * Creates a new ResourceService instance
	 * @param {import('ioredis').Redis} redis - Redis client instance
	 */
	constructor(redis) {
		super();
		this.redis = redis;
	}

	/**
	 * Creates a new resource and caches it
	 * @param {Object} resourceData - Data for the new resource
	 * @returns {Promise<Object>} The created resource
	 * @throws {Error} If resource creation fails
	 */
	async createResource(resourceData) {
		try {
			const resource = new Resource(resourceData);
			await resource.save();

			// Cache the resource
			await this.cacheResource(resource);

			// Emit resource creation event
			this.emit("resourceCreated", resource);

			return resource;
		} catch (error) {
			console.error("Error creating resource:", error);
			throw new Error(`Failed to create resource: ${error.message}`);
		}
	}

	/**
	 * Caches a resource in Redis
	 * @private
	 * @param {Object} resource - Resource to cache
	 * @returns {Promise<void>}
	 */
	async cacheResource(resource) {
		try {
			const cacheKey = `resource:${resource._id}`;
			await this.redis.setex(
				cacheKey,
				APP_CONSTANTS.CACHE.RESOURCE_TTL,
				JSON.stringify(resource),
			);
		} catch (error) {
			console.error("Cache error:", error);
			// Don't throw - caching errors shouldn't break the main flow
		}
	}

	/**
	 * Finds resources near a geographic point
	 * @param {number} latitude - Latitude coordinate
	 * @param {number} longitude - Longitude coordinate
	 * @param {Object} options - Search options
	 * @param {number} [options.maxDistance] - Maximum distance in meters
	 * @param {string} [options.type] - Resource type filter
	 * @param {string[]} [options.status] - Resource status filter
	 * @returns {Promise<Array>} Array of nearby resources
	 */
	async findNearbyResources(latitude, longitude, options = {}) {
		try {
			const {
				maxDistance = APP_CONSTANTS.RESOURCE.MAX_DISTANCE,
				type,
				status = ["AVAILABLE", "LOW"],
			} = options;

			const query = {
				location: {
					$near: {
						$geometry: {
							type: "Point",
							coordinates: [longitude, latitude],
						},
						$maxDistance: maxDistance,
					},
				},
				status: { $in: status },
			};

			if (type) {
				query.type = type;
			}

			return await Resource.find(query)
				.populate("updatedBy", "username")
				.exec();
		} catch (error) {
			console.error("Error finding nearby resources:", error);
			throw new Error(`Failed to find nearby resources: ${error.message}`);
		}
	}

	/**
	 * Updates a resource's status and metadata
	 * @param {string} resourceId - ID of the resource to update
	 * @param {Object} updates - Update data
	 * @param {string} updates.status - New status
	 * @param {number} updates.quantity - New quantity
	 * @param {string} updates.updatedBy - User ID making the update
	 * @returns {Promise<Object|null>} Updated resource or null if not found
	 */
	async updateResourceStatus(resourceId, updates) {
		try {
			const resource = await Resource.findByIdAndUpdate(
				resourceId,
				{
					...updates,
					lastUpdated: new Date(),
				},
				{ new: true },
			).populate("updatedBy", "username email");

			if (resource) {
				await this.cacheResource(resource);
				this.emit("resourceUpdated", resource);
			}

			return resource;
		} catch (error) {
			console.error("Error updating resource:", error);
			throw new Error(`Failed to update resource: ${error.message}`);
		}
	}

	/**
	 * Performs bulk updates on multiple resources
	 * @param {Array<Object>} updates - Array of update operations
	 * @returns {Promise<Object>} Results of bulk update operation
	 */
	async bulkUpdateResources(updates) {
		const success = [];
		const failed = [];
		const session = await Resource.startSession();

		try {
			await session.withTransaction(async () => {
				for (const update of updates) {
					try {
						const resource = await this.updateResourceStatus(
							update.resourceId,
							update,
						);
						if (resource) {
							success.push(update.resourceId);
						} else {
							failed.push(update.resourceId);
						}
					} catch (error) {
						console.error(
							`Failed to update resource ${update.resourceId}:`,
							error,
						);
						failed.push(update.resourceId);
					}
				}
			});
		} catch (error) {
			console.error("Bulk update transaction failed:", error);
			throw new Error(`Bulk update failed: ${error.message}`);
		} finally {
			await session.endSession();
		}

		return { success, failed };
	}

	/**
	 * Checks and updates expired resources
	 * @returns {Promise<void>}
	 */
	async checkResourceExpiration() {
		try {
			const expiredResources = await Resource.find({
				expiryDate: { $lt: new Date() },
				status: { $ne: "DEPLETED" },
			});

			for (const resource of expiredResources) {
				await this.updateResourceStatus(resource._id, {
					status: "DEPLETED",
					quantity: 0,
					updatedBy: "SYSTEM",
				});
			}
		} catch (error) {
			console.error("Error checking resource expiration:", error);
			throw new Error(`Failed to check resource expiration: ${error.message}`);
		}
	}
}

export default ResourceService;
