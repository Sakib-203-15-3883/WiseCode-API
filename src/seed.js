import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from "uuid";
import { db } from "./data.js";

const PLATFORMS = ["Instagram", "YouTube", "TikTok", "X", "Facebook"];
const CATEGORIES = [
  "Tech",
  "Fashion",
  "Travel",
  "Food",
  "Gaming",
  "Fitness",
  "Beauty",
  "Education",
];
const COUNTRIES = ["US", "UK", "BD", "IN", "CA", "AU", "DE", "FR", "JP"];

function makeInfluencer() {
  const platform = faker.helpers.arrayElement(PLATFORMS);
  const category = faker.helpers.arrayElement(CATEGORIES);
  const country = faker.helpers.arrayElement(COUNTRIES);
  const followers = faker.number.int({ min: 1000, max: 5_000_000 });
  const engagementRate = Number(
    faker.number.float({ min: 0.1, max: 20, precision: 0.01 }).toFixed(2)
  );
  const createdAt = faker.date.between({ from: "2023-01-01", to: new Date() });

  return {
    id: uuidv4(),
    name: faker.person.fullName(),
    platform,
    country,
    followers,
    engagementRate,
    category,
    bio: faker.lorem.sentence(),
    avatar: faker.image.avatar(),
    createdAt: createdAt.toISOString(),
  };
}

export function seed({ n = 2000 } = {}) {
  db.influencers = Array.from({ length: n }, makeInfluencer)
    // default sort: newest first
    .sort(
      (a, b) =>
        b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id)
    );

  db.users = [
    {
      id: "u-admin",
      email: "admin@example.com",
      password: "Admin123!",
      role: "admin",
      name: "Admin",
    },
    {
      id: "u-viewer",
      email: "viewer@example.com",
      password: "Viewer123!",
      role: "viewer",
      name: "Viewer",
    },
  ];
}
