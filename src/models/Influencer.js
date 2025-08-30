import { db } from "../data.js";
import { v4 as uuidv4 } from "uuid";

export class Influencer {
  static findById(id) {
    return db.influencers.find(influencer => influencer.id === id);
  }

  static findByIdAndUpdate(id, updateData) {
    const index = db.influencers.findIndex(influencer => influencer.id === id);
    if (index !== -1) {
      db.influencers[index] = { ...db.influencers[index], ...updateData };
      return db.influencers[index];
    }
    return null;
  }

  static findByIdAndDelete(id) {
    const index = db.influencers.findIndex(influencer => influencer.id === id);
    if (index !== -1) {
      return db.influencers.splice(index, 1)[0];
    }
    return null;
  }

  static getAll() {
    return db.influencers;
  }

  static create(influencerData) {
    const now = new Date().toISOString();
    const influencer = { 
      id: uuidv4(), 
      createdAt: now, 
      ...influencerData 
    };
    db.influencers.unshift(influencer); // keep newest-first order
    return influencer;
  }

  static filter(filters) {
    let items = db.influencers.filter((x) => {
      if (filters.platform && x.platform !== filters.platform) return false;
      if (filters.country && x.country?.toLowerCase() !== String(filters.country).toLowerCase())
        return false;
      if (filters.category && x.category !== filters.category) return false;
      if (filters.min_followers && x.followers < Number(filters.min_followers)) return false;

      // Specific name-only search
      if (filters.name) {
        const nameNeedle = String(filters.name).toLowerCase();
        if (!x.name.toLowerCase().includes(nameNeedle)) return false;
      }

      // Backward-compatible broad search
      if (filters.q) {
        const hay = `${x.name} ${x.bio} ${x.category} ${x.platform}`.toLowerCase();
        if (!hay.includes(String(filters.q).toLowerCase())) return false;
      }
      return true;
    });

    return items;
  }

  static sort(items, sortBy = "createdAt", order = "desc") {
    const dir = order === "asc" ? 1 : -1;
    return items.sort((a, b) => {
      if (sortBy === "followers") return (a.followers - b.followers) * dir;
      if (sortBy === "engagementRate")
        return (a.engagementRate - b.engagementRate) * dir;
      // default createdAt desc + id asc
      const c = b.createdAt.localeCompare(a.createdAt) * (dir === 1 ? -1 : 1);
      return c !== 0 ? c : a.id.localeCompare(b.id);
    });
  }
}
