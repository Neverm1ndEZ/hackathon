// src/routes/index.ts
import { Router } from "express";
import { resourceRoutes } from "./api/resources.js";
import { userRoutes } from "./api/users.js";
import { alertRoutes } from "./api/alerts.js";
import { knowledgeRoutes } from "./api/knowledge.js";

const router = Router();

// Mount routes
router.use("/resources", resourceRoutes);
router.use("/users", userRoutes);
router.use("/alerts", alertRoutes);
router.use("/knowledge", knowledgeRoutes);

// Health check route
router.get("/health", (req, res) => {
	res.status(200).json({
		status: "healthy",
		timestamp: new Date().toISOString(),
	});
});

export default router;
