import fastify from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";

import orderRouter from "./src/routes/order/orders.routes";
import cartRouter from "./src/routes/cart/cart.routes";

import config from "./src/config";
import { MessageBroker } from "@/utils/broker/message.broker";
import { Producer, Consumer } from "kafkajs";

const server = fastify();
const cfg = config();
const start = async () => {
  try {
    // Register Swagger
    await server.register(fastifySwagger, {
      swagger: {
        info: {
          title: "Catalog Service API",
          description: "API documentation for the Catalog Microservice",
          version: "1.0.0",
        },
        externalDocs: {
          url: "https://swagger.io",
          description: "Find more info here",
        },
        host: `localhost:${cfg.SERVER.APP_PORT}`,
        schemes: ["http"],
        consumes: ["application/json"],
        produces: ["application/json"],
      },
    });

    // Register Swagger UI
    await server.register(fastifySwaggerUI, {
      routePrefix: "/docs",
      uiConfig: {
        docExpansion: "full",
        deepLinking: false,
      },
    });

    // Kafka message broker setup
    const producer = await MessageBroker.connectProducer<Producer>();
    producer.on(producer.events.CONNECT, () =>
      console.log("Producer connected")
    );

    // Move to message service
    //   const consumer = await MessageBroker.connectConsumer<Consumer>();
    //   try {
    //     consumer.on(consumer.events.CONNECT, () =>
    //       console.log("Consumer connected")
    //     );
    //   } catch (error) {
    //     console.error("Consumer connection error:", error);
    //     throw error;
    //   }

    // await MessageBroker.subscribe("OrderEvents", async (message) => {
    //   console.log("Consumer received message:");
    //   console.log("Message Received", message);
    // });

    await server.register(cartRouter, { prefix: "/cart", ...cfg });
    await server.register(orderRouter, { prefix: "/order" });

    await server.listen({ port: cfg.SERVER.APP_PORT, host: "0.0.0.0" });
    server.log.info(
      `Swagger UI available at http://localhost:${cfg.SERVER.APP_PORT}/docs`
    );
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  } finally {
    // await prisma.$disconnect();
  }
};

start();
