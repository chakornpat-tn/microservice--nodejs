import { ProductRepository } from "../../repositories/product/productRepository";
import { ProductInteractors } from "../../interactors/product/productInteractor";
import { PrismaClient } from "../../generated/prisma";
import { ProductEvents } from "../../types";
import { ProductQueueController } from "../../controllers/product/productQueueController";
import { Product } from "../../entities/product";

export default async function (
  event: string,
  options: { prisma: PrismaClient }
) {
  const { prisma } = options;
  const productRepository = new ProductRepository(prisma);
  const productInteractors = new ProductInteractors(productRepository, prisma);
  const productQueueController = new ProductQueueController(productInteractors);

  switch (event) {
    case ProductEvents.CREATE_PRODUCT:
      productQueueController.productKafkaEventCall();
      break;
    default:
      break;
  }
}
