import { Product } from "../../entities/product";
import { IProductInteractors } from "../../interfaces/product/IProductInteractors";
import { IProductRepository } from "../../interfaces/product/IProductReposiotories";

export class ProductInteractors implements IProductInteractors {
  private repository: IProductRepository;

  constructor(repository: IProductRepository) {
    this.repository = repository;
  }

  async createProduct(
    name: string,
    description: string,
    price: number,
    stock: number
  ): Promise<Product> {
    const product = { name, description, price, stock };
    return this.repository.create(product);
  }

  async getProduct(limit: number, offset: number): Promise<Product[]> {
    return this.repository.find(limit, offset);
  }

  async getProductById(id: number): Promise<Product | null> {
    return this.repository.getById(id);
  }

  async updateStock(id: number, stock: number): Promise<Product> {
    if (stock < 0) {
      throw new Error("Stock cannot be negative");
    }

    const product = await this.repository.getById(id);
    if (!product) {
      throw new Error(`Product with id ${id} not found`);
    }

    const updatedProduct = { ...product, stock };
    return this.repository.update(updatedProduct);
  }
}
