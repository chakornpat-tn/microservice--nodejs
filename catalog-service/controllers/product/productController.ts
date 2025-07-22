import { FastifyReply, FastifyRequest } from "fastify";
import { IProductInteractors } from "../../interfaces/product/IProductInteractors";

export class ProductController {
  private interactor: IProductInteractors;

  constructor(interactor: IProductInteractors) {
    this.interactor = interactor;
  }
  onCreateProduct = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { name, description, price, stock } = request.body as {
        name: string;
        description: string;
        price: number;
        stock: number;
      };

      const product = await this.interactor.createProduct(
        name,
        description,
        price,
        stock
      );

      return reply.status(200).send({
        message: "product created successfully",
        data: product,
      });
    } catch (error) {
      console.error("Product creation error:", error);
      return reply.status(500).send({ error: "create product failed" });
    }
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

      const product = await this.interactor.getProductById(parsedId);

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
      const { id, stock } = request.body as { id: number; stock: number };

      await this.interactor.updateStock(id, stock);

      return reply
        .status(202)
        .send({ message: "stock update event published" });
    } catch (error) {
      console.log(error);
      reply.status(500).send({ error: "update stock failed" });
    }
  };
}
