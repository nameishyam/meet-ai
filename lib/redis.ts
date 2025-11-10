import Redis from "ioredis";

declare global {
  var redisClient: Redis | undefined;
}

const redisUrl = process.env.NEXT_REDIS_URL;
if (!redisUrl) {
  throw new Error("NEXT_REDIS_URL environment variable is not set");
}

let redis: Redis;

if (process.env.NODE_ENV === "production") {
  redis = new Redis(redisUrl);
} else {
  if (!global.redisClient) {
    global.redisClient = new Redis(redisUrl);
  }
  redis = global.redisClient;
}

export default redis;
