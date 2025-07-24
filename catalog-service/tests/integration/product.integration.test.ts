import supertest from "supertest";
import { FastifyInstance } from "fastify";
import { PrismaClient } from "../../generated/prisma";

jest.mock("../../pkg/broker/message.broker", () => ({
  MessageBroker: {
    connectConsumer: jest.fn().mockResolvedValue({
      on: jest.fn(),
      events: {
        CONNECT: "connect",
      },
    }),
    subscribe: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("../../pkg/eventLog", () => ({
  eventLog: {
    createEventLog: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("../../pkg/redis/redisClient", () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
  },
}));

import { buildApp } from "../../server";

let server: FastifyInstance;
let prisma: PrismaClient;

beforeAll(async () => {
  const app = await buildApp();
  server = app.server;
  prisma = app.prisma;

  await server.listen({ port: 0 });
});

afterAll(async () => {
  await server.close();
  await prisma.$disconnect();
});

describe("Product API", () => {
  it("should return 'pong' on /ping", async () => {
    const response = await supertest(server.server).get("/ping");
    expect(response.status).toBe(200);
    expect(response.text).toBe("pong\n");
  });

  describe("POST /product", () => {
    it("should create a new product", async () => {
      const newProduct = {
        name: "Test Product",
        description: "This is a test product",
        price: 9.99,
        stock: 100,
      };

      const response = await supertest(server.server)
        .post("/product")
        .send(newProduct);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("product created successfully");
      expect(response.body.data).toMatchObject({
        name: newProduct.name,
        description: newProduct.description,
        price: newProduct.price,
        stock: newProduct.stock,
      });
    });
  });

  describe("GET /product", () => {
    it("should retrieve a list of products", async () => {
      const mockProducts = [
        {
          id: 1,
          name: "Product 1",
          description: "Description 1",
          price: 10.0,
          stock: 50,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 2,
          name: "Product 2",
          description: "Description 2",
          price: 20.0,
          stock: 30,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      (prisma.product.findMany as jest.Mock) = jest.fn().mockResolvedValue(mockProducts);

      const response = await supertest(server.server).get(
        "/product?limit=2&offset=0"
      );

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("products retrieved successfully");
      expect(response.body.data).toEqual(mockProducts);
      expect(prisma.product.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 2,
      });
    });

    it("should retrieve a product by ID", async () => {
      const mockProduct = {
        id: 1,
        name: "Product 1",
        description: "Description 1",
        price: 10.0,
        stock: 50,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      (prisma.product.findUnique as jest.Mock) = jest.fn().mockResolvedValue(mockProduct);

      const response = await supertest(server.server).get("/product/1");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("product retrieved successfully");
      expect(response.body.data).toEqual(mockProduct);
      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should return 404 for a non-existent product ID", async () => {
      (prisma.product.findUnique as jest.Mock) = jest.fn().mockResolvedValue(null);

      const response = await supertest(server.server).get("/product/999");

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("product not found");
      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });

    it("should return 400 for an invalid product ID", async () => {
      const response = await supertest(server.server).get("/product/abc");

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Invalid product ID");
    });
  });
});
