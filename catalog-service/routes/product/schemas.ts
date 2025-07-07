export const createProductSchema = {
  summary: "Creates a new product",
  description: "Takes product details and creates a new product in the database.",
  tags: ["Product"],
  body: {
    type: "object",
    required: ["name", "description", "price", "stock"],
    properties: {
      name: { type: "string", description: "Name of the product" },
      description: { type: "string", description: "Detailed description of the product" },
      price: { type: "number", description: "Price of the product" },
      stock: { type: "integer", description: "Available stock quantity" },
    },
  },
  response: {
    200: {
      description: "Successful response",
      type: "object",
      properties: {
        message: { type: "string" },
        data: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            description: { type: "string" },
            price: { type: "number" },
            stock: { type: "integer" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
    500: {
      description: "Error response",
      type: "object",
      properties: { error: { type: "string" } },
    },
  },
};

export const getProductsSchema = {
  summary: "Get a list of products",
  description: "Retrieves a paginated list of products from the database.",
  tags: ["Product"],
  querystring: {
    type: "object",
    properties: {
      limit: {
        type: "string",
        description: "Number of products to retrieve",
        default: "10",
        pattern: "^[0-9]+$"
      },
      offset: {
        type: "string", 
        description: "Number of products to skip for pagination",
        default: "0",
        pattern: "^[0-9]+$"
      },
    },
  },
  response: {
    200: {
      description: "Successful response",
      type: "object",
      properties: {
        message: { type: "string" },
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "integer" },
              name: { type: "string" },
              description: { type: "string" },
              price: { type: "number" },
              stock: { type: "integer" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
        },
      },
    },
    500: {
      description: "Error response",
      type: "object",
      properties: { error: { type: "string" } },
    },
  },
};

export const updateStockSchema = {
  description: "Updates the stock quantity of a product",
  tags: ["Product"],
  body: {
    type: "object",
    required: ["id", "stock"],
    properties: {
      id: {
        type: "integer",
        description: "Product ID"
      },
      stock: {
        type: "integer",
        description: "New stock quantity"
      }
    }
  },
  response: {
    202: {
      description: "Stock update event published successfully",
      type: "object",
      properties: {
        message: { type: "string" }
      }
    },
    404: {
      description: "Product not found",
      type: "object",
      properties: {
        error: { type: "string" }
      }
    },
    500: {
      description: "Error response",
      type: "object",
      properties: {
        error: { type: "string" }
      }
    }
  }
};
