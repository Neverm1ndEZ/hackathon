// src/routes/api/knowledge.ts
import { Router } from "express";
import { KnowledgeController } from "../../controllers/KnowledgeController.js";
import { KnowledgeService } from "../../services/KnowledgeService.js";
import { authMiddleware } from "../../middleware/auth.js";
import { validate } from "../../middleware/validation.js";
import { rateLimiter } from "../../middleware/rateLimiter.js";

const router = Router();
const knowledgeService = new KnowledgeService(/* inject Redis client */);
const knowledgeController = new KnowledgeController(knowledgeService);

router
	.route("/")
	.post(
		authMiddleware,
		validate("createArticle"),
		rateLimiter,
		knowledgeController.createArticle,
	)
	.get(
		validate("searchKnowledge"),
		rateLimiter,
		knowledgeController.searchKnowledge,
	);

router.get(
	"/offline",
	validate("getOfflineArticles"),
	rateLimiter,
	knowledgeController.getOfflineArticles,
);

router.post(
	"/:articleId/review",
	authMiddleware,
	validate("reviewArticle"),
	rateLimiter,
	knowledgeController.reviewArticle,
);

export { router as knowledgeRoutes };
