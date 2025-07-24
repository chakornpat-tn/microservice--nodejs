import { Product } from "../../entities/product";
import { IProductRepository } from "../../interfaces/product/IProductReposiotories";
import { ProductInteractors } from "./productInteractor";
import { PrismaClient } from "../../generated/prisma";

jest.mock("../../pkg/redis/redisClient", () => ({
  get: jest.fn(),
  set: jest.fn(),
}));

jest.mock("../../pkg/eventLog/eventStore", () => ({
  createEventLog: jest.fn(),
}));

const mockProductRepository: jest.Mocked<IProductRepository> = {
  create: jest.fn(),
  find: jest.fn(),
  getById: jest.fn(),
  update: jest.fn(),
};

const mockPrisma = {
  catalogOutboxEvent: {
    create: jest.fn(),
  },
} as unknown as jest.Mocked<PrismaClient>; 

describe("ProductInteractors", () => {
  let interactor: ProductInteractors;

  beforeEach(() => {
    jest.clearAllMocks();
    interactor = new ProductInteractors(mockProductRepository, mockPrisma);
  });

  describe("createProduct", () => {
    test("should create a product successfully", async () => {
      const input = {
        name: "Test Product",
        description: "This is a test product.",
        price: 99,
        stock: 100,
      };
      const expectedProduct: Product = {
        id: 1,
        ...input,
      };
      mockProductRepository.create.mockResolvedValue(expectedProduct);

      const result = await interactor.createProduct(
        input.name,
        input.description,
        input.price,
        input.stock
      );

      expect(mockProductRepository.create).toHaveBeenCalledWith(input);
      expect(result).toEqual(expectedProduct);
    });

    test("should throw an error if repository fails to create", async () => {
      const input = {
        name: "Test Product",
        description: "This is a test product.",
        price: 99,
        stock: 100,
      };
      const dbError = new Error("Database connection error");
      mockProductRepository.create.mockRejectedValue(dbError);

      await expect(
        interactor.createProduct(
          input.name,
          input.description,
          input.price,
          input.stock
        )
      ).rejects.toThrow("Database connection error");
      expect(mockProductRepository.create).toHaveBeenCalledWith(input);
    });
  });

  describe("getProduct", () => {
    test("should return a list of products", async () => {
      const products: Product[] = [
        { id: 1, name: "P1", description: "D1", price: 10, stock: 10 },
        { id: 2, name: "P2", description: "D2", price: 20, stock: 20 },
      ];
      mockProductRepository.find.mockResolvedValue(products);

      const result = await interactor.getProduct(2, 0);

      expect(mockProductRepository.find).toHaveBeenCalledWith(2, 0);
      expect(result).toEqual(products);
    });
  });

  describe("getProductById", () => {
    test("should return a product when found", async () => {
      const product: Product = {
        id: 1,
        name: "P1",
        description: "D1",
        price: 10,
        stock: 10,
      };
      mockProductRepository.getById.mockResolvedValue(product);

      const result = await interactor.getProductById(1);

      expect(mockProductRepository.getById).toHaveBeenCalledWith(1);
      expect(result).toEqual(product);
    });

    test("should return null when product is not found", async () => {
      mockProductRepository.getById.mockResolvedValue(null);

      const result = await interactor.getProductById(999);

      expect(mockProductRepository.getById).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });
  });

  describe("updateStock", () => {
    test("should update product stock successfully", async () => {
      const existingProduct: Product = {
        id: 1,
        name: "P1",
        description: "D1",
        price: 10,
        stock: 10,
      };

      const updatedProduct: Product = { ...existingProduct, stock: 50 };
      mockProductRepository.getById.mockResolvedValue(existingProduct);
      mockProductRepository.update.mockResolvedValue(updatedProduct);

      const result = await interactor.updateStock(1, 50);

      expect(mockProductRepository.getById).toHaveBeenCalledWith(1);
      expect(mockProductRepository.update).toHaveBeenCalledWith(updatedProduct);
      expect(result).toEqual(updatedProduct);
    });

    test("should throw an error for negative stock", async () => {
      await expect(interactor.updateStock(1, -10)).rejects.toThrow(
        "Stock cannot be negative"
      );
      expect(mockProductRepository.getById).not.toHaveBeenCalled();
      expect(mockProductRepository.update).not.toHaveBeenCalled();
    });

    test("should throw an error if product to update is not found", async () => {
      mockProductRepository.getById.mockResolvedValue(null);

      await expect(interactor.updateStock(999, 50)).rejects.toThrow(
        "Product with id 999 not found"
      );
      expect(mockProductRepository.getById).toHaveBeenCalledWith(999);
      expect(mockProductRepository.update).not.toHaveBeenCalled();
    });
  });
});
