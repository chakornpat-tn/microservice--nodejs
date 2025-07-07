import { CartRepositoryType } from "@/types/cart/repository.type";
import { PrismaClient } from "@/generated/prisma";
import { CreateCartRequest } from "@/types/cart/request.type";

const prisma = new PrismaClient();



const createCart = async (request: CreateCartRequest): Promise<any> => {
  const { customerId, productId, itemName, variant, qty, price } = request;
  const cart = await prisma.cart.create({
    data: {
      customerId,
      lineItems: {
        create: [{
          productId,
          itemName,
          variant,
          qty,
          price
        }]
      }
    }
  });
  return cart;
};
const getCart = async (input: any): Promise<any> => {
  return Promise.resolve({ message: "get cart from service" });
};
const editCart = async (input: any): Promise<any> => {
  return Promise.resolve({ message: "edit cart from service" });
};
const deleteCart = async (input: any): Promise<any> => {
  return Promise.resolve({ message: "delete cart from service" });
};

export const CartRepository: CartRepositoryType = {
  create: createCart,
  find: getCart,
  update: editCart,
  delete: deleteCart,
};
