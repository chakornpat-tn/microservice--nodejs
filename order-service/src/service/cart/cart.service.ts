import { CartRepositoryType } from "@/types/cart/repository.type";
import { CreateCartRequest } from "@/types/cart/request.type";
import { Config } from "@/types/config/config.type";
import { OrderEvents, TOPIC_TYPE } from "@/types/subscription.type";
import { GetProductDetails } from "@/utils/broker/api";
import { MessageBroker } from "@/utils/broker/message.broker";
import { Kafka } from "kafkajs";

const eventSource = "OrderService";
export const CreateCart = async (
  cfg: Config,
  request: any,
  repo: CartRepositoryType
) => {
  const product = await GetProductDetails(cfg, request.productId);
  if (product.stock <= 0) {
    throw new Error("Product is out of stock");
  }

  const createCartRequest: CreateCartRequest = {
    customerId: request.customerId,
    productId: request.productId,
    qty: request.qty,
    itemName: product.name,
    variant: request.variant,
    price: product.price,
  };

  const data = await repo.create(createCartRequest);

  await MessageBroker.publish({
    topic: "OrderEvents",
    event: OrderEvents.CREATE_CART,
    headers: {
      source: eventSource,
      timestamp: new Date().toISOString(),
    },
    message: {
      data,
    },
  });

  return data;
};

export const GetCart = async (request: any, repo: CartRepositoryType) => {
  const data = await repo.find(request);
  return data;
};

export const EditCart = async (reqeust: any, repo: CartRepositoryType) => {
  const data = await repo.update(reqeust);
  return data;
};

export const DeleteCart = async (request: any, repo: CartRepositoryType) => {
  const data = await repo.delete(request);
  return data;
};
