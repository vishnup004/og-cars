import { productModel } from "../../models/product.js";

export const relatedProductService = async (query) => {
    return await productModel.find(query)
}