// import knex from "knex";

import { Product, productsRepository } from "../repositories/productsRepository";
import { Response } from "../types/response";

export type CreateProduct = Omit<Product, "id" | "created_at">;

export class ProductsService {
    async createProduct(request: CreateProduct): Promise<Response> {
        if (!request.name?.trim()) {
            return {
                success: false,
                message: "Product name is required."
            };
        }

        if (request.qty < 0) {
            return {
                success: false,
                message: "Product quantity cannot be negative."
            };
        }

        const productId = await productsRepository.set({
            name: request.name.trim(),
            qty: request.qty,
            theme: request.theme,
        });

        if (!productId) {
            return {
                success: false,
                message: "Failed to create product."
            };
        }

        // return this.getProduct(productId);
        return  {
            success: true,
            message: "Created product successfully."
        };
    }

    async updateProduct(productId) Promise<Response> {
        let result: boolean = productsRepository.update();

        if(!result) {
            return {
                success: false,
                message: "Error in update product"
            };
        }

        return {
            success: true,
            message: "Product updated successfully"
        };
    }

    async decrease(productId: number, qty: number): Promise<Response> {

        const getResult: Response = await this.getProduct(productId);
        const product = getResult.data;

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

    async getAllProducts(productId: number): Promise<Response> {
        const result = await productsRepository.getAllProducts(productId);

        if(!result) {
            return {
                success: false,
                message: "Products not found"
            };
        }

        return {
            success: true,
            message: "Products found successfully",
            data: result
        };
    }

    async isInOrder(productId: number): Promise<boolean | Response> {
        const result = await productsRepository.getProductInOrder(productId);

        if (result === false) {
            return {
                success: false,
                message: "Failed to found product",
            };
        }

        return result.length > 0;
    }

    async deleteProduct(productId: number): Promise<Response> {
        const getResult = await this.getProduct(productId);

        if (!getResult.success) {
            return getResult;
        }

        const inOrder = await this.isInOrder(productId);

        // if (inOrder.success === false) {
        //     return {
        //         success: false,
        //         message: "Failed to verify if product is in an order."
        //     };
        // }
// 
        // if (typeof inOrder !== 'boolean') {
        //     return inOrder; // já é Response com success: false
        // }

        if (inOrder) {
            return {
                success: false,
                message: "Cannot delete product because it is associated with one or more orders."
            };
        } 

        const deleteResult = await productsRepository.delete(productId);

        if (!deleteResult) {
            return {
                success: false,
                message: "Failed to delete product."
            };
        }

        return {
            success: true,
            message: "Product deleted successfully."
        };
    }
}

export const productsService = new ProductsService();