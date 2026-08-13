import { Request, Response, NextFunction } from "express";
import logger from "../logger";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const traceId = (req as any).traceId;

  // Log incoming request immediately
  logger.info(`→ [${traceId}] ${req.method} ${req.originalUrl}`);

  // Log response when it finishes
  res.on("finish", () => {
    const ms = Date.now() - start;
    const level = res.statusCode >= 500 ? "error"
                : res.statusCode >= 400 ? "warn"
                : "info";
    logger[level](`← [${traceId}] ${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
  });

  next();
};
