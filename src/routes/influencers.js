import express from "express";
import { db } from "../data.js";
import { ok, err } from "../utils/errors.js";
import { authRequired, requireRole } from "../auth-middleware.js";
import { paginateSorted } from "../utils/pagination.js";
import {
  InfluencerCreateSchema,
  InfluencerPatchSchema,
} from "../validators.js";
import { v4 as uuidv4 } from "uuid";

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
influencersRouter.get("/", (req, res) => {
  const {
    cursor,
    limit,
    platform,
    country,
    min_followers,
    category,
    q, // (kept for backward-compat: searches name/bio/category/platform)
    name, // NEW: free-text by name only
    sort = "createdAt",
    order = "desc",
  } = req.query;

  // Filter
  let items = db.influencers.filter((x) => {
    if (platform && x.platform !== platform) return false;
    if (country && x.country?.toLowerCase() !== String(country).toLowerCase())
      return false;
    if (category && x.category !== category) return false;
    if (min_followers && x.followers < Number(min_followers)) return false;

    // Specific name-only search (NEW)
    if (name) {
      const nameNeedle = String(name).toLowerCase();
      if (!x.name.toLowerCase().includes(nameNeedle)) return false;
    }

    // Backward-compatible broad search (optional)
    if (q) {
      const hay =
        `${x.name} ${x.bio} ${x.category} ${x.platform}`.toLowerCase();
      if (!hay.includes(String(q).toLowerCase())) return false;
    }
    return true;
  });

  // Sort (stable for pagination: createdAt DESC, id ASC as base)
  const dir = order === "asc" ? 1 : -1;
  items = items.sort((a, b) => {
    if (sort === "followers") return (a.followers - b.followers) * dir;
    if (sort === "engagementRate")
      return (a.engagementRate - b.engagementRate) * dir;
    // default createdAt desc + id asc
    const c = b.createdAt.localeCompare(a.createdAt) * (dir === 1 ? -1 : 1);
    return c !== 0 ? c : a.id.localeCompare(b.id);
  });

  const { data, pageInfo } = paginateSorted(items, {
    cursor,
    limit: Number(limit) || 20,
  });
  return res.json(ok(data, { pageInfo, total: items.length }));
});

/** GET /influencers/:id */
influencersRouter.get("/:id", (req, res) => {
  const item = db.influencers.find((x) => x.id === req.params.id);
  if (!item)
    return res.status(404).json(err("NOT_FOUND", "Influencer not found"));
  return res.json(ok(item));
});

/** POST /influencers (admin) */
influencersRouter.post("/", requireRole("admin"), (req, res) => {
  const parsed = InfluencerCreateSchema.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json(err("BAD_REQUEST", "Invalid body", parsed.error.flatten()));

  const now = new Date().toISOString();
  const item = { id: uuidv4(), createdAt: now, ...parsed.data };
  db.influencers.unshift(item); // keep newest-first order
  return res.status(201).json(ok(item));
});

/** PATCH /influencers/:id (admin) */
influencersRouter.patch("/:id", requireRole("admin"), (req, res) => {
  const idx = db.influencers.findIndex((x) => x.id === req.params.id);
  if (idx < 0)
    return res.status(404).json(err("NOT_FOUND", "Influencer not found"));
  const parsed = InfluencerPatchSchema.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json(err("BAD_REQUEST", "Invalid body", parsed.error.flatten()));

  db.influencers[idx] = { ...db.influencers[idx], ...parsed.data };
  return res.json(ok(db.influencers[idx]));
});

/** DELETE /influencers/:id (admin) */
influencersRouter.delete("/:id", requireRole("admin"), (req, res) => {
  const idx = db.influencers.findIndex((x) => x.id === req.params.id);
  if (idx < 0)
    return res.status(404).json(err("NOT_FOUND", "Influencer not found"));
  const [deleted] = db.influencers.splice(idx, 1);
  return res.json(ok({ id: deleted.id }));
});
