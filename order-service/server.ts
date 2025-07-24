import fastify, { FastifyInstance } from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";

import orderRouter from "./src/routes/order/orders.routes";
import cartRouter from "./src/routes/cart/cart.routes";

import { recordHttpRequest, getMetrics, metricsContentType } from "@/utils/promClient";

import config from "./src/config";

const server = fastify();
const cfg = config();

const start = async () => {
  await setupMetrics(server);
  try {
    await server.register(fastifySwagger, {
      swagger: {
        info: {
          title: "Order Service API",
          description: "API documentation for the Order Microservice",
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

start();
