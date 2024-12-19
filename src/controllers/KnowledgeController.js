// src/controllers/KnowledgeController.js

export class KnowledgeController {
	constructor(knowledgeService) {
		this.knowledgeService = knowledgeService;
	}

	// Create knowledge base article
	createArticle = async (req, res, next) => {
		try {
			const article = await this.knowledgeService.createArticle({
				...req.body,
				author: req.user.id, // From auth middleware
			});

			res.status(201).json({
				success: true,
				data: article,
			});
		} catch (error) {
			next(error);
		}
	};

	// Search knowledge base
	searchKnowledge = async (req, res, next) => {
		try {
			const {
				query,
				category,
				tags,
				language,
				region,
				page = 1,
				limit = 10,
			} = req.query;

			const searchResults = await this.knowledgeService.searchKnowledge({
				query: query,
				category: category,
				tags: tags ? tags.split(",") : undefined,
				language: language,
				region: region,
				limit: Number(limit),
				offset: (Number(page) - 1) * Number(limit),
			});

			res.status(200).json({
				success: true,
				data: searchResults,
			});
		} catch (error) {
			next(error);
		}
	};

	// Get offline articles
	getOfflineArticles = async (req, res, next) => {
		try {
			const { language, region } = req.query;

			const articles = await this.knowledgeService.getOfflineArticles(
				language,
				region,
			);

			res.status(200).json({
				success: true,
				data: articles,
			});
		} catch (error) {
			next(error);
		}
	};

	// Review article
	reviewArticle = async (req, res, next) => {
		try {
			const { articleId } = req.params;
			const { status, comments } = req.body;

			const article = await this.knowledgeService.reviewArticle(
				articleId,
				req.user.id,
				status,
				comments,
			);

			res.status(200).json({
				success: true,
				data: article,
			});
		} catch (error) {
			next(error);
		}
	};
}
