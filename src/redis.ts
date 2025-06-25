import { createClient } from "redis";

export const redisClient = await createClient()
  .on("error", (err) => console.log("Redis Client Error", err))
  .connect();
