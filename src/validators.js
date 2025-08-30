import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const InfluencerCreateSchema = z.object({
  name: z.string().min(2),
  platform: z.enum(["Instagram", "YouTube", "TikTok", "X", "Facebook"]),
  country: z.string().min(2).max(2), // ISO-2 for simplicity
  followers: z.number().int().min(0),
  engagementRate: z.number().min(0),
  category: z.string().min(2),
  bio: z.string().default(""),
  avatar: z.string().url().optional(),
});

export const InfluencerPatchSchema = InfluencerCreateSchema.partial();
