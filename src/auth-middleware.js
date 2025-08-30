import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config.js";
import { err } from "./utils/errors.js";

export function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token)
    return res.status(401).json(err("UNAUTHORIZED", "Missing Bearer token"));
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res
      .status(401)
      .json(err("UNAUTHORIZED", "Invalid or expired token"));
  }
}

export const requireRole = (role) => (req, res, next) => {
  if (!req.user)
    return res.status(401).json(err("UNAUTHORIZED", "Login required"));
  if (req.user.role !== role)
    return res.status(403).json(err("FORBIDDEN", `Requires role: ${role}`));
  next();
};
