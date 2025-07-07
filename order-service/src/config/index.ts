import { Config } from "@/types/config/config.type";
const config = {
  SERVER: {
    APP_PORT: Number(process.env.PORT) || 3000,
    CATALOG_BASE_URL: process.env.CATALOG_BASE_URL,
  },
  BORKER: {
    CLIENT_ID: process.env.CLIENT_ID,
    GROUP_ID: process.env.GROUP_ID,
    BROKER_1: process.env.BROKER_1,
  },
  REDIS: {
    URL: process.env.REDIS_URL,
  },
};

export default function (): Config {
  return config;
}
