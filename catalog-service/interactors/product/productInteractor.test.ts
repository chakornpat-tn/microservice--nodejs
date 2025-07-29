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

const mockProductRepo = {
  create: jest.fn(),
  find: jest.fn(),
  getById: jest.fn(),
  update: jest.fn(),
} as jest.Mocked<IProductRepository>;

const mockPrisma = {
  catalogOutboxEvent: { create: jest.fn() },
} as unknown as jest.Mocked<PrismaClient>;

const makeProduct = (overrides?: Partial<Product>): Product => ({
  id: 1,
  name: "P1",
  description: "D1",
  price: 10,
  stock: 10,
  ...overrides,
});

const makeInput = () => ({
  name: "Test Product",
  description: "Test description",
  price: 99,
  stock: 100,
});

describe("ProductInteractors", () => {
  let sut: ProductInteractors;

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new ProductInteractors(mockProductRepo, mockPrisma);
  });

  describe("createProduct", () => {
    it("creates and returns a product", async () => {
      const input = makeInput();
      const product = makeProduct(input);
      mockProductRepo.create.mockResolvedValue(product);

      const result = await sut.createProduct(input);

      expect(mockProductRepo.create).toHaveBeenCalledWith(input);
      expect(result).toEqual(product);
    });

    it("propagates repository errors", async () => {
      const input = makeInput();
      const error = new Error("DB failed");
      mockProductRepo.create.mockRejectedValue(error);

      await expect(sut.createProduct(input)).rejects.toThrow(error);
    });
  });

  describe("getProduct", () => {
    it("returns paginated products", async () => {
      const products = [makeProduct({ id: 1 }), makeProduct({ id: 2 })];
      mockProductRepo.find.mockResolvedValue(products);

      const result = await sut.getProduct(2, 0);

      expect(mockProductRepo.find).toHaveBeenCalledWith(2, 0);
      expect(result).toEqual(products);
    });
  });

  describe("getProductById", () => {
    it("returns product when found", async () => {
      const product = makeProduct();
      mockProductRepo.getById.mockResolvedValue(product);

      const result = await sut.getProductById(1);

      expect(mockProductRepo.getById).toHaveBeenCalledWith(1);
      expect(result).toEqual(product);
    });

    it("returns null when not found", async () => {
      mockProductRepo.getById.mockResolvedValue(null);

      const result = await sut.getProductById(999);

      expect(result).toBeNull();
    });
  });

  describe("updateStock", () => {
    it("updates stock and returns updated product", async () => {
      const product = makeProduct();
      const updated = { ...product, stock: 50 };
      mockProductRepo.getById.mockResolvedValue(product);
      mockProductRepo.update.mockResolvedValue(updated);

      const result = await sut.updateStock(1, 50);

      expect(mockProductRepo.update).toHaveBeenCalledWith(updated);
      expect(result).toEqual(updated);
    });

    it("throws on negative stock", async () => {
      await expect(sut.updateStock(1, -5)).rejects.toThrow(
        "Stock cannot be negative"
      );
    });

    it("throws if product does not exist", async () => {
      mockProductRepo.getById.mockResolvedValue(null);

      await expect(sut.updateStock(99, 5)).rejects.toThrow(
        "Product with id 99 not found"
      );
    });
  });
});
