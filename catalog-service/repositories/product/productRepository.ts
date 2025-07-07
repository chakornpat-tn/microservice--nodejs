import { Product } from "../../entities/product";
import { PrismaClient } from "../../generated/prisma";
import { IProductRepository } from "../../interfaces/product/IProductReposiotories";

export class ProductRepository implements IProductRepository {
  _prisma: PrismaClient;
  constructor(prisma: PrismaClient) {
    this._prisma = prisma;
  }
  async create(data: Product): Promise<Product> {
    return this._prisma.product.create({
      data,
    });
  }

  async find(limit: number, offset: number): Promise<Product[]> {
    return this._prisma.product.findMany({
      take: limit,
      skip: offset,
    });
  }

  async getById(id: number): Promise<Product | null> {
    return this._prisma.product.findUnique({
      where: { id },
    });
  }

  async update(product: Product): Promise<Product> {
    return this._prisma.product.update({
      where: { id: product.id },
      data: product,
    });
  }
}
