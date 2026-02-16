import winston from "winston";
import path from "path";
import fs from "fs";
import DailyRotateFile from "winston-daily-rotate-file";

const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) {
  try {
    fs.mkdirSync(logDir);
  } catch (err) {
    console.error("⚠️ Could not create logs folder:", err);
  }
}

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(
    (info) => `[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}`
  )
);

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }),
];

try {
  transports.push(
    new DailyRotateFile({
      filename: path.join(logDir, "combined-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "10m",
      maxFiles: "14d",
      level: "info",
    }),
    new DailyRotateFile({
      filename: path.join(logDir, "error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "10m",
      maxFiles: "30d",
      level: "error",
    })
  );
} catch (err) {
  console.error("⚠️ Daily rotation disabled (file system restricted):", err);
}

export const logger = winston.createLogger({
  level: "info",
  format: logFormat,
  transports,
});

logger.on("error", (err) => {
  console.error("⚠️ Logger transport error:", err.message);
});

/**
 * Helper that returns a logger scoped to a specific traceId.
 */
export const getLoggerWithTrace = (traceId: string) => {
  const formatMessage = (msg: any) => `[traceId=${traceId}] ${msg}`;

  return {
    info: (msg: any) => logger.info(formatMessage(msg)),
    error: (msg: any) => logger.error(formatMessage(msg)),
    warn: (msg: any) => logger.warn(formatMessage(msg)),
    debug: (msg: any) => logger.debug(formatMessage(msg)),
  };
};

export default logger;
