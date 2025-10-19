import winston from "winston";
import path from "path";
import fs from "fs";
import DailyRotateFile from "winston-daily-rotate-file";

// Ensure logs directory exists (ZolaHost-safe)
const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) {
  try {
    fs.mkdirSync(logDir);
  } catch (err) {
    console.error("⚠️ Could not create logs folder:", err);
  }
}

// Common log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(
    (info) => `[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}`
  )
);

// Transports setup (console + daily rotating files)
const transports: winston.transport[] = [];

// Console (always works)
transports.push(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  })
);

// Daily rotating file (combined logs)
try {
  transports.push(
    new DailyRotateFile({
      filename: path.join(logDir, "combined-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "10m",
      maxFiles: "14d", // keep 14 days
      level: "info",
    })
  );

  transports.push(
    new DailyRotateFile({
      filename: path.join(logDir, "error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "10m",
      maxFiles: "30d", // keep 30 days of errors
      level: "error",
    })
  );
} catch (err) {
  console.error("⚠️ Daily rotation disabled (file system restricted):", err);
}

// Create logger instance
export const logger = winston.createLogger({
  level: "info",
  format: logFormat,
  transports,
});

// Handle unexpected logger errors
logger.on("error", (err) => {
  console.error("⚠️ Logger transport error:", err.message);
});

export default logger;
