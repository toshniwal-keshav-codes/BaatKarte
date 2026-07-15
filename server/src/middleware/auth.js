import { verifyAccessToken } from "../modules/auth/tokens.js";
import { HttpError } from "./error.js";
import { User } from "../models/User.js";

export async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) throw new HttpError(401, "Unauthorized", "no_token");
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub);
    if (!user) throw new HttpError(401, "Unauthorized", "user_missing");
    req.user = user;
    next();
  } catch (err) {
    if (err instanceof HttpError) return next(err);
    next(new HttpError(401, "Unauthorized", "bad_token"));
  }
}