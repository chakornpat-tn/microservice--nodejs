import axios from "axios";
import { Config } from "@/types/config/config.type";
import { Product } from "@/types/product/product.entity";

export const GetProductDetails = async (cfg: Config, productId: string) => {
  try {
    const response = await axios.get(
      `${cfg.SERVER.CATALOG_BASE_URL}/product/${productId}`
    );
    return response.data.data as Product;
  } catch (error) {
    throw new Error("product not found");
  }
};
