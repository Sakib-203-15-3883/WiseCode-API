import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { ResponseView } from "../views/ResponseView.js";
import { LoginSchema } from "../validators.js";
import { JWT_SECRET } from "../config.js";

export class AuthController {
  static async login(req, res) {
    try {
      const parse = LoginSchema.safeParse(req.body);
      if (!parse.success) {
        return res
          .status(400)
          .json(ResponseView.badRequest("Invalid login body", parse.error.flatten()));
      }

      const { email, password } = parse.data;
      const user = User.findByCredentials(email, password);
      
      if (!user) {
        return res
          .status(401)
          .json(ResponseView.unauthorized("Email or password is incorrect"));
      }

      const token = jwt.sign(
        { sub: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      return res.json(ResponseView.success(ResponseView.authResponse(token, user)));
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json(ResponseView.internalError());
    }
  }

  static async getProfile(req, res) {
    try {
      const user = User.findById(req.user.sub);
      if (!user) {
        return res.status(404).json(ResponseView.notFound("User not found"));
      }
      
      return res.json(ResponseView.success(ResponseView.userProfile(user)));
    } catch (error) {
      console.error("Get profile error:", error);
      return res.status(500).json(ResponseView.internalError());
    }
  }
}
