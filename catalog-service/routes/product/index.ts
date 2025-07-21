import { FastifyInstance } from "fastify";
import { ProductController } from "../../controllers/product/productController";
import { ProductRepository } from "../../repositories/product/productRepository";
import { ProductInteractors } from "../../interactors/product/productInteractor";
import { PrismaClient } from "../../generated/prisma";
import { createProductSchema, getProductsSchema, updateStockSchema } from "./schemas";

export default async function (
  fastify: FastifyInstance,
  options: { prisma: PrismaClient }
) {
  const { prisma } = options;
  const productRepository = new ProductRepository(prisma);
  const productInteractors = new ProductInteractors(productRepository);
  const productController = new ProductController(productInteractors, prisma);

  fastify.post(
    "/",
    { schema: createProductSchema },
    productController.onCreateProduct
  );
  fastify.put(
    "/",
    { schema: updateStockSchema },
    productController.onUpdateStock
  )

  fastify.get(
    "/",

    { schema: getProductsSchema },
    productController.onGetProducts
  );
  fastify.get("/:id", productController.onGetProductById);
}
