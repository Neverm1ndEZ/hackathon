// src/services/SyncService.js
// Handles data synchronization between online and offline states
const { Resource } = require("../models/Resource.js");
const { EmergencyAlert } = require("../models/EmergencyAlert.js");
const { KnowledgeBase } = require("../models/KnowledgeBase.js");

class SyncService {
	constructor(redis) {
		this.redis = redis;
	}

	/**
	 * Handle client data synchronization
	 * @param {string} userId - ID of the user
	 * @param {Object} clientData - Data from the client
	 * @returns {Promise<Object>} - Synchronization result
	 */
	async synchronizeClientData(userId, clientData) {
		const result = {
			success: true,
			updates: 0,
			errors: [],
		};

		const serverTimestamp = await this.getLastSyncTimestamp(userId);

		try {
			// Start a transaction for data consistency
			const session = await Resource.startSession();
			await session.withTransaction(async () => {
				// Sync resources
				if (clientData.resources) {
					const resourceUpdates = await this.syncResources(
						clientData.resources,
						serverTimestamp,
					);
					result.updates += resourceUpdates;
				}

				// Sync alerts
				if (clientData.alerts) {
					const alertUpdates = await this.syncAlerts(
						clientData.alerts,
						serverTimestamp,
					);
					result.updates += alertUpdates;
				}

				// Sync knowledge base
				if (clientData.knowledge) {
					const knowledgeUpdates = await this.syncKnowledgeBase(
						clientData.knowledge,
						serverTimestamp,
					);
					result.updates += knowledgeUpdates;
				}

				// Update last sync timestamp
				await this.updateSyncTimestamp(userId);
			});
		} catch (error) {
			result.success = false;
			result.errors.push(error.message);
		}

		return result;
	}

	/**
	 * Sync resources
	 * @param {Array} resources - Resources to sync
	 * @param {number} serverTimestamp - Last sync timestamp from the server
	 * @returns {Promise<number>} - Number of updates
	 */
	async syncResources(resources, serverTimestamp) {
		let updates = 0;

		for (const resource of resources) {
			try {
				const existingResource = await Resource.findById(resource._id);

				if (!existingResource) {
					// New resource
					await Resource.create(resource);
					updates++;
				} else if (resource.lastUpdated > serverTimestamp) {
					// Updated resource
					await Resource.findByIdAndUpdate(resource._id, resource);
					updates++;
				}
			} catch (error) {
				console.error(`Error syncing resource ${resource._id}:`, error);
			}
		}

		return updates;
	}

	/**
	 * Sync alerts
	 * @param {Array} alerts - Alerts to sync
	 * @param {number} serverTimestamp - Last sync timestamp from the server
	 * @returns {Promise<number>} - Number of updates
	 */
	async syncAlerts(alerts, serverTimestamp) {
		let updates = 0;

		for (const alert of alerts) {
			try {
				const existingAlert = await EmergencyAlert.findById(alert._id);

				if (!existingAlert) {
					// New alert
					await EmergencyAlert.create(alert);
					updates++;
				} else if (alert.lastUpdated > serverTimestamp) {
					// Updated alert
					await EmergencyAlert.findByIdAndUpdate(alert._id, alert);
					updates++;
				}
			} catch (error) {
				console.error(`Error syncing alert ${alert._id}:`, error);
			}
		}

		return updates;
	}

	/**
	 * Sync knowledge base
	 * @param {Array} knowledge - Knowledge base articles to sync
	 * @param {number} serverTimestamp - Last sync timestamp from the server
	 * @returns {Promise<number>} - Number of updates
	 */
	async syncKnowledgeBase(knowledge, serverTimestamp) {
		let updates = 0;

		for (const article of knowledge) {
			try {
				const existingArticle = await KnowledgeBase.findById(article._id);

				if (!existingArticle) {
					// New article
					await KnowledgeBase.create(article);
					updates++;
				} else if (article.lastUpdated > serverTimestamp) {
					// Updated article
					await KnowledgeBase.findByIdAndUpdate(article._id, article);
					updates++;
				}
			} catch (error) {
				console.error(`Error syncing knowledge article ${article._id}:`, error);
			}
		}

		return updates;
	}

	/**
	 * Get the last sync timestamp for a user
	 * @param {string} userId - ID of the user
	 * @returns {Promise<number>} - Last sync timestamp
	 */
	async getLastSyncTimestamp(userId) {
		const timestamp = await this.redis.get(`sync:${userId}:timestamp`);
		return timestamp ? parseInt(timestamp, 10) : 0;
	}

	/**
	 * Update the sync timestamp for a user
	 * @param {string} userId - ID of the user
	 */
	async updateSyncTimestamp(userId) {
		await this.redis.set(`sync:${userId}:timestamp`, Date.now());
	}

	/**
	 * Get changes since last sync for a specific user
	 * @param {string} userId - ID of the user
	 * @returns {Promise<Object>} - Changes since last sync
	 */
	async getChangesSinceLastSync(userId) {
		const lastSync = await this.getLastSyncTimestamp(userId);

		// Gather all changes since last sync
		const [resources, alerts, knowledge] = await Promise.all([
			Resource.find({ lastUpdated: { $gt: lastSync } }),
			EmergencyAlert.find({ lastUpdated: { $gt: lastSync } }),
			KnowledgeBase.find({ lastUpdated: { $gt: lastSync } }),
		]);

		return {
			resources,
			alerts,
			knowledge,
			timestamp: Date.now(),
		};
	}

	/**
	 * Resolve sync conflicts
	 * @param {Object} serverData - Server data
	 * @param {Object} clientData - Client data
	 * @param {string} [strategy="LATEST_WINS"] - Conflict resolution strategy
	 * @returns {Promise<Object>} - Resolved data
	 */
	async resolveConflicts(serverData, clientData, strategy = "LATEST_WINS") {
		switch (strategy) {
			case "SERVER_WINS":
				return serverData;
			case "CLIENT_WINS":
				return clientData;
			case "LATEST_WINS":
				return serverData.lastUpdated > clientData.lastUpdated
					? serverData
					: clientData;
			default:
				throw new Error("Invalid conflict resolution strategy");
		}
	}
}

module.exports = { SyncService };
