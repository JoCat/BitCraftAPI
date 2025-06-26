import got from "got";
import { redisClient } from "./redis";

interface ConnectInfo {
  uri: string;
  name: string;
}

const MAIN_SERVER_CACHE_KEY = "BITCRAFT:MAIN_SERVER_DATA";

export async function getActualMainServer(): Promise<ConnectInfo> {
  const cachedConnectInfo = await redisClient.get(MAIN_SERVER_CACHE_KEY);

  if (cachedConnectInfo) {
    return JSON.parse(cachedConnectInfo);
  }

  const connectInfo = await fetchActualMainServer();

  await redisClient.set(MAIN_SERVER_CACHE_KEY, JSON.stringify(connectInfo), {
    expiration: { type: "EX", value: 60 * 60 },
  });

  return connectInfo;
}

async function fetchActualMainServer() {
  return await got
    .get("https://api.bitcraftonline.com/global-module/get-connection-info")
    .json<ConnectInfo>();
}
