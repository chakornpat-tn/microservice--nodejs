import { createProductRequest, Product, productWithDiscountPriceResponse } from "../../entities/product";

export interface IProductInteractors {
  createProduct(req: createProductRequest): Promise<Product>;
  getProduct(limit: number, offset: number): Promise<Product[]>;
  getProductById(id: number): Promise<Product | null>;
  updateStock(id: number, stock: number): Promise<Product>;
  getProdPriceWithDiscount(id:number) :Promise<productWithDiscountPriceResponse>;
}
