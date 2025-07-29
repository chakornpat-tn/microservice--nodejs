import {
  createProductRequest,
  Product,
  productWithDiscountPriceResponse,
} from "../../entities/product";
import { IProductInteractors } from "../../interfaces/product/IProductInteractors";
import { IProductRepository } from "../../interfaces/product/IProductReposiotories";
import { PrismaClient as CatalogPrismaClient } from "../../generated/prisma";
import redisClient from "../../pkg/redis/redisClient";
import { createEventLog } from "../../pkg/eventLog/eventStore";
import { ProductEvents } from "../../types";
import { propagation, context, trace } from "@opentelemetry/api";
import { parseSync } from "sformula";

const eventSource = "ProductService";

export class ProductInteractors implements IProductInteractors {
  private repository: IProductRepository;
  private prisma: CatalogPrismaClient;

  constructor(repository: IProductRepository, prisma: CatalogPrismaClient) {
    this.repository = repository;
    this.prisma = prisma;
  }

  async createProduct(request: createProductRequest): Promise<Product> {
    const tracer = trace.getTracer("catalog-service");
    return await tracer.startActiveSpan(
      "ProductInteractor.createProduct",
      async (span) => {
        try {
          const createdProduct = await this.repository.create({
            ...request,
          });

          const traceHeaders: Record<string, string> = {};
          propagation.inject(context.active(), traceHeaders);

          await createEventLog({
            source: eventSource,
            eventType: ProductEvents.CREATE_PRODUCT,
            payload: { data: createdProduct },
          });

          await this.prisma.catalogOutboxEvent.create({
            data: {
              eventType: ProductEvents.CREATE_PRODUCT,
              source: eventSource,
              payload: JSON.stringify({
                product: createdProduct,
                traceContext: traceHeaders,
              }),
              topic: "ProductEvents",
              key: ProductEvents.CREATE_PRODUCT,
            },
          });

          return createdProduct;
        } catch (error) {
          span.recordException(error as Error);
          throw error;
        } finally {
          span.end();
        }
      }
    );
  }

  async getProduct(limit: number, offset: number): Promise<Product[]> {
    const tracer = trace.getTracer("catalog-service");
    return await tracer.startActiveSpan(
      "ProductInteractor.getProduct",
      async (span) => {
        try {
          return this.repository.find(limit, offset);
        } catch (error) {
          span.recordException(error as Error);
          throw error;
        } finally {
          span.end();
        }
      }
    );
  }

  async getProductById(id: number): Promise<Product | null> {
    const tracer = trace.getTracer("catalog-service");
    return await tracer.startActiveSpan(
      "ProductInteractor.getProductById",
      async (span) => {
        try {
          const cacheKey = `product:${id}`;
          const cachedProduct = await redisClient.get(cacheKey);
          if (cachedProduct) {
            return JSON.parse(cachedProduct) as Product;
          }

          const product = await this.repository.getById(id);
          if (product) {
            await redisClient.set(
              cacheKey,
              JSON.stringify(product),
              "EX",
              3600
            );
          }
          return product;
        } catch (error) {
          span.recordException(error as Error);
          throw error;
        } finally {
          span.end();
        }
      }
    );
  }

  async updateStock(id: number, stock: number): Promise<Product> {
    const tracer = trace.getTracer("catalog-service");
    return await tracer.startActiveSpan(
      "ProductInteractor.updateStock",
      async (span) => {
        try {
          if (stock < 0) {
            throw new Error("Stock cannot be negative");
          }

          const product = await this.repository.getById(id);
          if (!product) {
            throw new Error(`Product with id ${id} not found`);
          }

          const updatedProduct = { ...product, stock };
          const prodUpdate = await this.repository.update(updatedProduct);

          await createEventLog({
            source: eventSource,
            eventType: ProductEvents.UPDATE_STOCK,
            payload: { data: prodUpdate },
          });

          await this.prisma.catalogOutboxEvent.create({
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

          return prodUpdate;
        } catch (error) {
          span.recordException(error as Error);
          throw error;
        } finally {
          span.end();
        }
      }
    );
  }
  async getProdPriceWithDiscount(
    id: number
  ): Promise<productWithDiscountPriceResponse> {
    const prod = await this.getProductById(id);
    if (!prod) throw new Error("Product not found");
    if (!prod.discountFormula) throw new Error("No discount formula provided");
    try {
      const formula = parseSync(prod.discountFormula, {
        inputTypes: {
          price: { type: "number" },
          stock: { type: "number" },
        },
      });

      const result = {
        ...prod,
        price: formula.evaluate({ price: prod.price, stock: prod.stock }),
      } as productWithDiscountPriceResponse;

      return result;
    } catch (err: any) {
      throw new Error(
        `Error calculating product price with discount: ${err.message}`
      );
    }
  }
}
