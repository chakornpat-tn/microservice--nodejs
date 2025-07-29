export class Product {
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly price: number,
    public readonly stock: number,
    public readonly discountFormula?: string|null,
    public readonly id?: number
  ) {}
}

export type createProductRequest = {
  name: string;
  description: string;
  price: number;
  stock: number;
  discountFormula?: string; 
}

export type productWithDiscountPriceResponse = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}