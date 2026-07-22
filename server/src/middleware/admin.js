import { HttpError } from "./error.js";

export function requireAdmin(req, _res, next) {
  if (!req.user) {
    return next(new HttpError(401, "Unauthorized", "no_user"));
  }
  if (req.user.role !== "admin") {
    return next(new HttpError(403, "Admin privileges required", "admin_required"));
  }
  next();
}
