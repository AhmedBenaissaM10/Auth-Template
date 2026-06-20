import { createClient } from "redis";
import {env} from '../config/env'
const redisClient = createClient({url: process.env.REDIS_URL});

redisClient.on("error", (err) => {
  console.error(err);
});

export const redisConnection = async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
            console.log("Redis Connected");
        }
    } catch (error) {
        console.error("Redis connection failed:", error);
        process.exit(1);
    }
};


export default redisClient