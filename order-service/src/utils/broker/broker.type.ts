import { MessageType, OrderEvents, TOPIC_TYPE } from "../../types/subscription.type";

export interface PublishType {
  headers: Record<string, any>;
  topic: TOPIC_TYPE;
  event: OrderEvents;
  message: Record<string, any>;
}

export type MessageHandler = (message: MessageType) => void;
export type MessageBrokerType = {
  // producer
  connectProducer : <T>() => Promise<T>;
  disconnectProducer: () => Promise<void>;
  publish: (data: PublishType) => Promise<boolean>;

  // consumer
  connectConsumer: <T>() => Promise<T>;
  disconnectConsumer: () => Promise<void>;
  subscribe: (topic: string, messageHandler: MessageHandler) => Promise<void>;
};
