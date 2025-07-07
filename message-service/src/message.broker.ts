import { Consumer, Kafka, logLevel, Partitioners, Producer } from "kafkajs";
import {
  MessageBrokerType,
  MessageHandler,
  PublishType,
} from "../types/broker.type";
import {
  MessageType,
  AllEvents,
  TOPIC_TYPE,
} from "../types/subscription.type";

const CLIENT_ID = process.env.CLIENT_ID || "message-service-client";
const GROUP_ID = process.env.GROUP_ID || "message-service-group";
const BROKERS = [
  process.env.BROKER_1 || "localhost:9092",
  process.env.BROKER_2 || "localhost:9093",
];

const kafka = new Kafka({
  clientId: CLIENT_ID,
  brokers: BROKERS,
  logLevel: logLevel.INFO,
});

let producer: Producer;
let consumer: Consumer;

const createTopic = async (topics: string[]) => {
  const admin = kafka.admin();
  await admin.connect();
  const existingTopics = await admin.listTopics();

  const newTopics = topics
    .filter((t) => !existingTopics.includes(t))
    .map((t) => ({
      topic: t,
      numPartitions: 2,
      replicationFactor: 2,
    }));

  if (newTopics.length > 0) {
    await admin.createTopics({ topics: newTopics });
  }

  await admin.disconnect();
};

const connectProducer  = async <T>(): Promise<T> => {
  await createTopic(["ProductEvents"]);

  if (producer) {
    console.log("producer already connected with existing connection");
    return producer as unknown as T;
  }

  producer = kafka.producer({
    createPartitioner: Partitioners.DefaultPartitioner,
  });

  await producer.connect();
  console.log("producer connected with a new connection");
  return producer as unknown as T;
};

const disconnectProducer = async (): Promise<void> => {
  if (producer) {
    await producer.disconnect();
  }
};

const publish = async (data: PublishType): Promise<boolean> => {
  const producer = await connectProducer<Producer>();
  await createTopic([data.topic]);

  const result = await producer.send({
    topic: data.topic,
    messages: [
      {
        headers: data.headers,
        key: data.event,
        value: JSON.stringify(data.message),
      },
    ],
  });

  return !result;
};

const connectConsumer = async <T>(): Promise<T> => {
  if (consumer) {
    return consumer as unknown as T;
  }

  consumer = kafka.consumer({
    groupId: GROUP_ID,
  });

  await consumer.connect();
  return consumer as unknown as T;
};

const disconnectConsumer = async (): Promise<void> => {
  if (consumer) {
    await consumer.disconnect();
  }
};

const subscribe = async (
  topics: TOPIC_TYPE[],
  messageHandler: MessageHandler
): Promise<void> => {
  await connectConsumer<Consumer>();

  for (const topic of topics) {
    await consumer.subscribe({ topic, fromBeginning: true });
  }

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (message.key && message.value) {
        const inputMessage: MessageType = {
          headers: message.headers || {},
          event: message.key.toString() as AllEvents,
          data: JSON.parse(message.value.toString()),
        };

        await messageHandler(inputMessage);

        await consumer.commitOffsets([
          {
            topic,
            partition,
            offset: (Number(message.offset) + 1).toString(),
          },
        ]);
      }
    },
  });
};



export const MessageBroker: MessageBrokerType = {
  // producer
  connectProducer ,
  disconnectProducer,
  publish,

  // consumer
  connectConsumer,
  disconnectConsumer,
  subscribe,
};
