import { Product } from "../../entities/product";

export interface IProductRepository {
  create(data: Product): Promise<Product>;
  find(limit: number, offset: number): Promise<Product[]>;
  getById(id: number): Promise<Product | null>;
  update(product: Product): Promise<Product>;
}
