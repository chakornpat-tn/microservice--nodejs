import fastify, { FastifyInstance } from "fastify";
import productRouter from "./routes/product";
import productQueue from "./messageQueue/product";
import { PrismaClient } from "./generated/prisma";
import {
  recordHttpRequest,
  getMetrics,
  metricsContentType,
} from "./pkg/promClient";

import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import { MessageBroker } from "./pkg/broker/message.broker";
import { Consumer } from "kafkajs";

const PORT = Number(process.env.PORT) || 8080;

export async function buildApp() {
  const server = fastify();
  const prisma = new PrismaClient();

  await setupMetrics(server);

  server.get("/ping", async (request, reply) => {
    return "pong\n";
  });

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

  await server.register(fastifySwaggerUI, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "full",
      deepLinking: false,
    },
  });

  const consumer = await MessageBroker.connectConsumer<Consumer>();
  consumer.on(consumer.events.CONNECT, () => console.log("Consumer connected"));

  await MessageBroker.subscribe("ProductEvents", async (message) => {
    if (!message.event) return;
    await productQueue(message.event, { prisma });
  });

  await server.register(productRouter, { prefix: "/product", prisma });

  return { server, prisma };
}

async function setupMetrics(server: FastifyInstance) {
  server.addHook("onResponse", async (request, reply) => {
    recordHttpRequest(
      request.method,
      request.routeOptions.url || request.url,
      reply.statusCode
    );
  });

  server.get("/metrics", async (request, reply) => {
    reply.header("Content-Type", metricsContentType);
    reply.send(await getMetrics());
  });
}

if (require.main === module) {
  buildApp()
    .then(({ server }) => {
      server.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
        if (err) {
          server.log.error(err);
          process.exit(1);
        }
        server.log.info(`Swagger UI available at ${address}/docs`);
      });
    })
    .catch((err) => {
      console.error("Error starting server:", err);
      process.exit(1);
    });
}
