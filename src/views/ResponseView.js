import { ok, err } from "../utils/errors.js";

export class ResponseView {
  static success(data, meta = null) {
    return ok(data, meta);
  }

  static error(code, message, details = null) {
    return err(code, message, details);
  }

  static userProfile(user) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
  }

  static authResponse(token, user) {
    return {
      access_token: token,
      user: this.userProfile(user),
    };
  }

  static influencerList(data, pageInfo, total) {
    return this.success(data, { pageInfo, total });
  }

  static influencerDetail(influencer) {
    return this.success(influencer);
  }

  static influencerCreated(influencer) {
    return this.success(influencer);
  }

  static influencerUpdated(influencer) {
    return this.success(influencer);
  }

  static influencerDeleted(id) {
    return this.success({ id });
  }

  static notFound(message = "Resource not found") {
    return this.error("NOT_FOUND", message);
  }

  static badRequest(message = "Bad request", details = null) {
    return this.error("BAD_REQUEST", message, details);
  }

  static unauthorized(message = "Unauthorized") {
    return this.error("UNAUTHORIZED", message);
  }

  static forbidden(message = "Forbidden") {
    return this.error("FORBIDDEN", message);
  }

  static internalError(message = "Something went wrong") {
    return this.error("INTERNAL_ERROR", message);
  }
}
