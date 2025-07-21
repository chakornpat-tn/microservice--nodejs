import { FastifyReply, FastifyRequest } from "fastify";
import { IProductInteractors } from "../../interfaces/product/IProductInteractors";
import { ProductEvents } from "../../types";
import { context, trace, propagation } from "@opentelemetry/api";

import redisClient from "../../utils/redis/redisClient";
import { Product } from "../../entities/product";
import { PrismaClient as CatalogPrismaClient } from "../../generated/prisma";
import { traceOperation } from "../../utils/Otel";

import { eventLog } from "../../utils/eventLog";

const catalogPrisma = new CatalogPrismaClient();

const event = eventLog;
const eventSource = "ProductService";

export class ProductController {
  private interactor: IProductInteractors;

  constructor(interactor: IProductInteractors) {
    this.interactor = interactor;
  }
  onCreateProduct = async (request: FastifyRequest, reply: FastifyReply) => {
    const tracer = trace.getTracer("catalog-service");

    return await tracer.startActiveSpan(
      "Product.onCreateProduct",
      async (span) => {
        try {
          span.setAttributes({
            "http.method": request.method,
            "http.url": request.url,
            "operation.name": "createProduct",
          });

          const createProdReq = await traceOperation(
            "parse-request",
            span,
            async () => {
              const body = request.body as {
                name: string;
                description: string;
                price: number;
                stock: number;
              };

              span.setAttributes({
                "product.name": body.name,
                "product.price": body.price,
                "product.stock": body.stock,
              });

              return body;
            }
          );

          const traceHeaders: Record<string, string> = {};
          propagation.inject(context.active(), traceHeaders);

          const product = await traceOperation(
            "create-product",
            span,
            async () => {
              return await this.interactor.createProduct(
                createProdReq.name,
                createProdReq.description,
                createProdReq.price,
                createProdReq.stock
              );
            }
          );

          await traceOperation("create-event-log", span, async () => {
            await event.createEventLog({
              source: eventSource,
              eventType: ProductEvents.CREATE_PRODUCT,
              payload: { product },
            });
          });

          await traceOperation("create-outbox-event", span, async () => {
            await catalogPrisma.catalogOutboxEvent.create({
              data: {
                eventType: ProductEvents.CREATE_PRODUCT,
                source: eventSource,
                payload: JSON.stringify({
                  product,
                  traceContext: traceHeaders,
                }),
                topic: "ProductEvents",
                key: ProductEvents.CREATE_PRODUCT,
              },
            });
          });

          span.setAttributes({
            "operation.success": true,
            "product.id": product.id || "unknown",
          });

          return reply.status(200).send({
            message: "product created successfully",
            data: product,
          });
        } catch (error) {
          span.recordException(error as Error);
          span.setAttributes({
            "operation.success": false,
            "error.message":
              error instanceof Error ? error.message : "Unknown error",
          });

          console.error("Product creation error:", error);
          return reply.status(500).send({ error: "create product failed" });
        } finally {
          span.end();
        }
      }
    );
  };
  onGetProducts = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { limit = "10", offset = "0" } = request.query as {
        limit?: string;
        offset?: string;
      };

      const products = await this.interactor.getProduct(
        parseInt(limit),
        parseInt(offset)
      );

      return reply.status(200).send({
        message: "products retrieved successfully",
        data: products,
      });
    } catch (error) {
      console.log(error);
      reply.status(500).send({ error: "get products failed" });
    }
  };

  onGetProductById = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const parsedId = parseInt(id);

      if (isNaN(parsedId)) {
        return reply.status(400).send({ error: "Invalid product ID" });
      }

      const cacheKey = `product:${parsedId}`;

      const cachedProduct = await redisClient.get(cacheKey);
      if (cachedProduct) {
        return reply.status(200).send({
          message: "product retrieved successfully (from cache)",
          data: JSON.parse(cachedProduct) as Product,
        });
      }

      const product = await this.interactor.getProductById(parsedId);
      await redisClient.set(cacheKey, JSON.stringify(product), "EX", 3600);

      if (!product) {
        return reply.status(404).send({ error: "product not found" });
      }
      return reply.status(200).send({
        message: "product retrieved successfully",
        data: product,
      });
    } catch (error) {
      console.log(error);
      reply.status(500).send({ error: "get product by id failed" });
    }
  };

  onUpdateStock = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.body as { id: number };
      const { stock } = request.body as { stock: number };

      const prodUpdate = await this.interactor.updateStock(id, stock);

      await event.createEventLog({
        source: eventSource,
        eventType: ProductEvents.UPDATE_STOCK,
        payload: prodUpdate,
      });

      await catalogPrisma.catalogOutboxEvent.create({
        data: {
          eventType: ProductEvents.UPDATE_STOCK,
          source: eventSource,
          payload: JSON.stringify({
            product: prodUpdate,
          }),
          topic: "ProductEvents",
          key: ProductEvents.UPDATE_STOCK,
        },
      });

      return reply
        .status(202)
        .send({ message: "stock update event published" });
    } catch (error) {
      console.log(error);
      reply.status(500).send({ error: "update stock failed" });
    }
  };
}
