import { FastifyInstance } from "fastify";

export default async function (fastify: FastifyInstance) {
  //   const { prisma } = options;
  //   const productRepository = new ProductRepository(prisma);
  //   const productInteractors = new ProductInteractors(productRepository);
  //   const productController = new ProductController(productInteractors);

  fastify.post(
    "/",
    // { schema: createProductSchema },
    () => {}
  );
  fastify.put(
    "/",
    // { schema: updateStockSchema },
    () => {}
  );

  fastify.get(
    "/",

    // { schema: getProductsSchema },
    () => {}
  );
  fastify.get("/:id", () => {});
}
