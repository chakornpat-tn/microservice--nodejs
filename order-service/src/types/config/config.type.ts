export type Config = {
  SERVER: {
    APP_PORT: number;
    CATALOG_BASE_URL: string | undefined;
  };
  BORKER: {
    CLIENT_ID: string | undefined;
    GROUP_ID: string | undefined;
    BROKER_1: string | undefined;
  };
  REDIS: {
    URL: string | undefined;
  };
};
