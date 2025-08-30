import express from "express";
import jwt from "jsonwebtoken";
import { db } from "../data.js";
import { ok, err } from "../utils/errors.js";
import { LoginSchema } from "../validators.js";
import { JWT_SECRET } from "../config.js";
import { authRequired } from "../auth-middleware.js";

export const authRouter = express.Router();

authRouter.post("/login", (req, res) => {
  const parse = LoginSchema.safeParse(req.body);
  if (!parse.success) {
    return res
      .status(400)
      .json(err("BAD_REQUEST", "Invalid login body", parse.error.flatten()));
  }
  const { email, password } = parse.data;
  const user = db.users.find(
    (u) => u.email === email && u.password === password
  );
  if (!user)
    return res
      .status(401)
      .json(err("INVALID_CREDENTIALS", "Email or password is incorrect"));

  const token = jwt.sign(
    { sub: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
  return res.json(
    ok({
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    })
  );
});

authRouter.get("/me", authRequired, (req, res) => {
  const u = db.users.find((x) => x.id === req.user.sub);
  if (!u) return res.status(404).json(err("NOT_FOUND", "User not found"));
  return res.json(ok({ id: u.id, email: u.email, role: u.role, name: u.name }));
});
