import { Influencer } from "../models/Influencer.js";
import { ResponseView } from "../views/ResponseView.js";
import { paginateSorted } from "../utils/pagination.js";
import {
  InfluencerCreateSchema,
  InfluencerPatchSchema,
} from "../validators.js";

export class InfluencerController {
  static async getAll(req, res) {
    try {
      const {
        cursor,
        limit,
        platform,
        country,
        min_followers,
        category,
        q,
        name,
        sort = "createdAt",
        order = "desc",
      } = req.query;

      // Apply filters
      const filters = {
        platform,
        country,
        min_followers,
        category,
        q,
        name,
      };
      
      let items = Influencer.filter(filters);

      // Apply sorting
      items = Influencer.sort(items, sort, order);

      // Apply pagination
      const { data, pageInfo } = paginateSorted(items, {
        cursor,
        limit: Number(limit) || 20,
      });

      return res.json(ResponseView.influencerList(data, pageInfo, items.length));
    } catch (error) {
      console.error("Get influencers error:", error);
      return res.status(500).json(ResponseView.internalError());
    }
  }

  static async getById(req, res) {
    try {
      const influencer = Influencer.findById(req.params.id);
      if (!influencer) {
        return res.status(404).json(ResponseView.notFound("Influencer not found"));
      }
      
      return res.json(ResponseView.influencerDetail(influencer));
    } catch (error) {
      console.error("Get influencer by ID error:", error);
      return res.status(500).json(ResponseView.internalError());
    }
  }

  static async create(req, res) {
    try {
      const parsed = InfluencerCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json(ResponseView.badRequest("Invalid body", parsed.error.flatten()));
      }

      const influencer = Influencer.create(parsed.data);
      return res.status(201).json(ResponseView.influencerCreated(influencer));
    } catch (error) {
      console.error("Create influencer error:", error);
      return res.status(500).json(ResponseView.internalError());
    }
  }

  static async update(req, res) {
    try {
      const influencer = Influencer.findById(req.params.id);
      if (!influencer) {
        return res.status(404).json(ResponseView.notFound("Influencer not found"));
      }

      const parsed = InfluencerPatchSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json(ResponseView.badRequest("Invalid body", parsed.error.flatten()));
      }

      const updatedInfluencer = Influencer.findByIdAndUpdate(req.params.id, parsed.data);
      return res.json(ResponseView.influencerUpdated(updatedInfluencer));
    } catch (error) {
      console.error("Update influencer error:", error);
      return res.status(500).json(ResponseView.internalError());
    }
  }

  static async delete(req, res) {
    try {
      const influencer = Influencer.findById(req.params.id);
      if (!influencer) {
        return res.status(404).json(ResponseView.notFound("Influencer not found"));
      }

      Influencer.findByIdAndDelete(req.params.id);
      return res.json(ResponseView.influencerDeleted(req.params.id));
    } catch (error) {
      console.error("Delete influencer error:", error);
      return res.status(500).json(ResponseView.internalError());
    }
  }
}
