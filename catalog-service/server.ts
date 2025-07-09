import fastify from "fastify";
import productRouter from "./routes/product";
import { PrismaClient } from "./generated/prisma";

import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";

const server = fastify();
const PORT = Number(process.env.PORT) || 8080;
const prisma = new PrismaClient();

server.get("/ping", async (request, reply) => {
  return "pong\n";
});

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
        host: `localhost:${PORT}`,
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
    
    

    // Move to message service 
    // const consumer = await MessageBroker.connectConsumer<Consumer>();
    // consumer.on(consumer.events.CONNECT, () =>
    //   console.log("Consumer connected")
    // );

    // await MessageBroker.subscribe("ProductEvents", async (message) => {
    //   console.log("Consumer received message:");
    //   console.log("Message Received", message);
    // });

    await server.register(productRouter, { prefix: "/product", prisma });

    await server.listen({ port: PORT, host: "0.0.0.0" });
    server.log.info(`Swagger UI available at http://localhost:${PORT}/docs`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

start();
