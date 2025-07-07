import { FastifyInstance } from "fastify";
import * as service from "@/service/cart/cart.service";
import * as repository from "@/reposiotry/cart/cart.repository";
import { Config } from "@/types/config/config.type";

const repo = repository.CartRepository;

export default async function (fastify: FastifyInstance,cfg:Config) {
  //   const { prisma } = options;
  //   const productRepository = new ProductRepository(prisma);
  //   const productInteractors = new ProductInteractors(productRepository);
  //   const productController = new ProductController(productInteractors);

  fastify.post(
    "/",
    // { schema: createProductSchema },
    async (request, reply) => {
      const createCartRequest = request.body;
      const data = await service.CreateCart(cfg, createCartRequest, repo);
      return reply.send(data);
    }
  );
  fastify.put(
    "/",
    // { schema: updateStockSchema },
    async (request, reply) => {
      const editCartRequest = request.body;
      const data = await service.EditCart(editCartRequest, repo);
      return reply.send(data);
    }
  );

  fastify.get(
    "/",
    // { schema: getProductsSchema },
    async (request, reply) => {
      const getCartRequest = request.body;
      const data = await service.GetCart(getCartRequest, repo);
      return reply.send(data);
    }
  );
  fastify.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = await service.GetCart(id, repo);
    return reply.send(data);
  });
}
