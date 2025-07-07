import { Consumer, Producer } from "kafkajs";
import { MessageBroker } from "./src/message.broker";

const start = async () => {
  // Kafka message broker setup
  // const producer = await MessageBroker.connectProducer<Producer>();
  // producer.on(producer.events.CONNECT, () => console.log("Producer connected"));
  const consumer = await MessageBroker.connectConsumer<Consumer>();
  consumer.on(consumer.events.CONNECT, () => console.log("Consumer connected"));

  await MessageBroker.subscribe(
    ["OrderEvents", "ProductEvents"],
    async (message) => {
      console.log("Consumer received message:");
      console.log("Message Received", message);
    }
  );
};

start().catch((err) => {
  console.error("Error starting the message service:", err);
  process.exit(1);
});
