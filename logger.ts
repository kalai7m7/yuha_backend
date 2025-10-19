import winston from "winston";
import path from "path";
import fs from "fs";

// Ensure logs folder exists
const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) {
  try {
    fs.mkdirSync(logDir);
  } catch (err) {
    console.error("⚠️ Could not create logs folder:", err);
  }
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(
    (info) => `[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}`
  )
);

// Create logger
export const logger = winston.createLogger({
  level: "info",
  format: logFormat,
  transports: [
    // Save logs to file if filesystem allows
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
    }),
  ],
});

// Add console logging (always available)
logger.add(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  })
);

// Gracefully handle ZolaHost (shared hosting) restrictions
logger.on("error", (err) => {
  console.error("⚠️ Logger transport error:", err.message);
});

export default logger;
