import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(
      (info) =>
        `[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}`,
    ),
  ),
  transports: [
    // 1. In ra console để xem lúc code
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    // 2. Ghi vào file nếu là lỗi (Error)
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    // 3. Ghi tất cả vào file combine
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

export default logger;
