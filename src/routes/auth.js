import express from "express";
import { AuthController } from "../controllers/index.js";
import { authRequired } from "../auth-middleware.js";

export const authRouter = express.Router();

authRouter.post("/login", AuthController.login);
authRouter.get("/me", authRequired, AuthController.getProfile);
