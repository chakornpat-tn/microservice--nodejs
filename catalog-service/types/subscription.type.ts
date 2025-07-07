export enum ProductEvents {
  CREATE_PRODUCT = "create_product",
  UPDATE_STOCK = "update_stock",
}

export type TOPIC_TYPE = "ProductEvents";

export interface MessageType {
  headers: Record<string, any>;
  event: ProductEvents ;
  data: Record<string, any>;
}
