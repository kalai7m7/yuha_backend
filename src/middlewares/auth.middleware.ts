import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AdminPayload } from "../types/auth";

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.cookies.admin_token;

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AdminPayload;

    req.user = decoded; // ✅ now typed
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};
