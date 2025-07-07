import { Product } from "../../entities/product";

export interface IProductInteractors {
  createProduct(
    name: string,
    description: string,
    price: number,
    stock: number
  ): Promise<Product>;
  getProduct(limit: number, offset: number): Promise<Product[]>;
  getProductById(id: number): Promise<Product | null>;
  updateStock(id: number, stock: number): Promise<Product>;
}
