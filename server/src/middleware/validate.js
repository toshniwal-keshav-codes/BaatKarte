import { HttpError } from "./error.js";

export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const first = result.error.issues[0];
    return next(new HttpError(400, first?.message || "Invalid input", "validation_error"));
  }
  req.body = result.data;
  next();
};