import express from "express";
import { InfluencerController } from "../controllers/index.js";
import { authRequired, requireRole } from "../auth-middleware.js";

export const influencersRouter = express.Router();

// All routes here require auth
influencersRouter.use(authRequired);

/**
 * GET /influencers
 * Query params:
 *  - cursor, limit
 *  - platform, country, min_followers, category
 *  - q (free text on name/bio/category/platform)
 *  - sort (followers|engagementRate|createdAt), order (asc|desc)
 */
influencersRouter.get("/", InfluencerController.getAll);

/** GET /influencers/:id */
influencersRouter.get("/:id", InfluencerController.getById);

/** POST /influencers (admin) */
influencersRouter.post("/", requireRole("admin"), InfluencerController.create);

/** PATCH /influencers/:id (admin) */
influencersRouter.patch("/:id", requireRole("admin"), InfluencerController.update);

/** DELETE /influencers/:id (admin) */
influencersRouter.delete("/:id", requireRole("admin"), InfluencerController.delete);
