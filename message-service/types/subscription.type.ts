export enum ProductEvents {
  CREATE_PRODUCT = "create_product",
  UPDATE_STOCK = "update_stock",
}

export enum OrderEvents {
  CREATE_CART = "create_cart",
}

export type AllEvents = ProductEvents | OrderEvents;

export type TOPIC_TYPE = "ProductEvents" | "OrderEvents";

export interface MessageType<T = Record<string, any>> {
  headers?: Record<string, any>;
  event: AllEvents;
  data: T;
}
