// import knex from "knex";

import { Product, productsRepository } from "../repositories/productsRepository";
import { Response } from "../types/response";

export class ProductsService {
    async decrease(productId: number, qty: number): Promise<Response> {

        const getResult: Response = await this.getProduct(productId);
        const product: Response = getResult.data;

        if(!getResult.success) {
            return getResult;
        }

        if(product.qty < qty) {
            return {
                success: false,
                message: "The quantity available is less than the requested."
            };
        }

        const decreaseResult = await productsRepository.decrease(productId, qty);

        if(!decreaseResult) {
            return {
                success: false,
                message: "Failed to decrease product quantity"
            };
        }

        return {
            success: true,
            message: "Product quantity decreased successfully"
        };
    }

    async increase(productId: number, qty: number): Promise<Response> {
        
        const increaseResult = await productsRepository.increase(productId, qty);

        if(!increaseResult) {
            return {
                success: false,
                message: "Failed to increase product quantity"
            };
        }

        return {
            success: true,
            message: "Product quantity increased successfully"
        };
    }

    async getProduct(productId: number): Promise<Response> {
        const result = await productsRepository.getProduct(productId);

        if(!result) {
            return {
                success: false,
                message: "Product not found"
            };
        }

        return {
            success: true,
            message: "Product found successfully",
            data: result
        };
    }
}

export const productsService = new ProductsService();