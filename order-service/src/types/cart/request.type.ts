export interface CreateCartRequest {
  customerId: number;
  productId: number;
  qty: number;
  itemName: string;
  variant?: string;
  price: number;
}
