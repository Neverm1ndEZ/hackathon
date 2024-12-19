// src/services/KnowledgeService.js
import { EventEmitter } from "events";
import { KnowledgeBase } from "../models/KnowledgeBase.js"; // Changed to default import

export class KnowledgeService extends EventEmitter {
	/**
	 * Creates a new KnowledgeService instance
	 * @param {import('ioredis').Redis} redis - Redis client instance
	 */
	constructor(redis) {
		super();
		this.redis = redis;
	}

	/**
	 * Creates a new knowledge base article with validation
	 * @param {Object} articleData - Data for the new article
	 * @returns {Promise<Object>} The created article
	 * @throws {Error} If validation fails or creation fails
	 */
	async createArticle(articleData) {
		try {
			// Validate article data before creation
			this.validateArticle(articleData);

			const article = new KnowledgeBase({
				...articleData,
				version: 1,
				lastUpdated: new Date(),
			});

			await article.save();
			await this.cacheArticle(article);
			this.emit("articleCreated", article);

			return article;
		} catch (error) {
			console.error("Error creating article:", error);
			throw new Error(`Failed to create article: ${error.message}`);
		}
	}

	/**
	 * Updates an existing article with version control and validation
	 * @param {string} articleId - ID of the article to update
	 * @param {Object} updates - Update data
	 * @returns {Promise<Object>} Updated article
	 */
	async updateArticle(articleId, updates) {
		try {
			const article = await KnowledgeBase.findById(articleId);
			if (!article) {
				throw new Error("Article not found");
			}

			// Validate updates
			this.validateArticle({ ...article.toObject(), ...updates });

			// Prepare update data with version control
			const updatedData = {
				...updates,
				version: article.version + 1,
				lastUpdated: new Date(),
			};

			const updatedArticle = await KnowledgeBase.findByIdAndUpdate(
				articleId,
				updatedData,
				{ new: true },
			);

			await this.cacheArticle(updatedArticle);
			this.emit("articleUpdated", updatedArticle);

			return updatedArticle;
		} catch (error) {
			console.error("Error updating article:", error);
			throw new Error(`Failed to update article: ${error.message}`);
		}
	}

	/**
	 * Searches knowledge base with comprehensive filtering
	 * @param {Object} params - Search parameters
	 * @returns {Promise<Object>} Search results with pagination
	 */
	async searchKnowledge(params) {
		try {
			const {
				query,
				category,
				tags,
				language = "en",
				region,
				limit = 10,
				offset = 0,
			} = params;

			const searchQuery = { language };

			// Build dynamic search query
			if (category) searchQuery.category = category;
			if (tags?.length) searchQuery.tags = { $all: tags };
			if (region) searchQuery.region = region;
			if (query) searchQuery.$text = { $search: query };

			// Execute paginated search
			const [items, total] = await Promise.all([
				KnowledgeBase.find(searchQuery)
					.sort({ priority: -1, lastUpdated: -1 })
					.skip(offset)
					.limit(limit)
					.exec(),
				KnowledgeBase.countDocuments(searchQuery),
			]);

			return {
				items,
				total,
				page: Math.floor(offset / limit) + 1,
				totalPages: Math.ceil(total / limit),
			};
		} catch (error) {
			console.error("Error searching knowledge base:", error);
			throw new Error(`Search failed: ${error.message}`);
		}
	}

	/**
	 * Retrieves articles for offline storage
	 * @param {string} language - Language code
	 * @param {string} region - Region code
	 * @returns {Promise<Array>} Array of offline-enabled articles
	 */
	async getOfflineArticles(language = "en", region) {
		try {
			const query = {
				language,
				offline: true,
			};

			if (region) query.region = region;

			return await KnowledgeBase.find(query).sort({ priority: -1 }).exec();
		} catch (error) {
			console.error("Error fetching offline articles:", error);
			throw new Error(`Failed to fetch offline articles: ${error.message}`);
		}
	}

	/**
	 * Manages the article review process
	 * @param {string} articleId - ID of the article to review
	 * @param {string} reviewerId - ID of the reviewing user
	 * @param {string} status - Review status
	 * @param {string} comments - Review comments
	 * @returns {Promise<Object>} Updated article
	 */
	async reviewArticle(articleId, reviewerId, status, comments) {
		try {
			const article = await KnowledgeBase.findById(articleId);
			if (!article) {
				throw new Error("Article not found");
			}

			// Update review metadata
			article.metadata = {
				...article.metadata,
				reviewStatus: status,
				verifiedBy: reviewerId,
				lastVerified: new Date(),
				reviewComments: comments || article.metadata.reviewComments,
			};

			await article.save();
			await this.cacheArticle(article);

			this.emit("articleReviewed", {
				articleId,
				status,
				reviewerId,
				comments,
			});

			return article;
		} catch (error) {
			console.error("Error reviewing article:", error);
			throw new Error(`Review failed: ${error.message}`);
		}
	}

	// Cache management methods remain the same but with improved error handling
	// ... (previous cache methods)

	/**
	 * Validates article data
	 * @param {Object} article - Article data to validate
	 * @throws {Error} If validation fails
	 */
	validateArticle(article) {
		const errors = [];

		if (!article.title?.trim()) {
			errors.push("Article title is required");
		}

		if (!article.content?.trim()) {
			errors.push("Article content is required");
		}

		if (!article.category) {
			errors.push("Article category is required");
		}

		if (article.tags?.length > 10) {
			errors.push("Maximum 10 tags allowed per article");
		}

		if (errors.length > 0) {
			throw new Error(errors.join("; "));
		}
	}
}

export default KnowledgeService;
