// src/redisClient.ts
import { createClient, RedisClientType } from "redis";

export const redisClient: RedisClientType = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err: Error) => console.error("Redis Client Error:", err));

// Ensure the client connects immediately
(async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log("Connected to Redis");
    }
  } catch (err) {
    console.error("Failed to connect to Redis:", err);
  }
})();
