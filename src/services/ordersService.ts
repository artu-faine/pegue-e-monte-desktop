import { ordersRepository, OrderWithProductsAndClient } from "../repositories/ordersRepository";
import { productsRepository } from "../repositories/productsRepository";
import { Response } from "../types/response";
import { productsService, ProductsService } from "./productsService";

// interface Request {
//     order_id: number,
//     products: Array<{
//         id: number,
//         name: string,
//         qty: number
//     }>
// }

export interface Order {
    id: number,
    declared_value: number,
    entry_value: number,
    final_value: number,
    created_at: Date,
    delivery_date: Date,
    client_name: string,
    products: Array<{
        id: number,
        name: string,
        qty: number
    }>
}

export class OrdersService {
    async updateOrder(request: Order): Promise<Response> {

        const orderResult: Response = await this.getOrder(request.id);

        if(!orderResult.success) {
            return orderResult;
        }

        const order: Order = orderResult.data;

        const updateResult = await ordersRepository.update(request);

        if(!updateResult) {
            return { 
                success: false,
                message: "Failed to update order data."
            };
        }

        for(let product of request.products) {

            if (!order.products.find(p => p.id === product.id)) {

                const addProductResponse =  await this.addProduct(request.id, product.id, product.qty);

                if(!addProductResponse.success) {
                    return addProductResponse;
                }

                continue;
            }

            const orderProduct = order.products[product.id];

            if(orderProduct!.qty < product.qty) {
                const qty = product.qty - orderProduct!.qty;

                await this.increaseProduct(request.id, product.id, qty);
            }

            if(orderProduct!.qty > product.qty) {
                const qty = orderProduct!.qty - product.qty;

                await this.decreaseProduct(request.id, product.id, qty);
            }
        }

        for(let product of order.products) {
            if (!request.products.find(p => p.id === product.id)) {
                await this.removeProduct(request.id, product.id, product.qty);
            }
        }

        return {
            success: true,
            message: "Success updated the order."
        };;
    }

    async getOrder(orderId: number) : Promise<Response> {

        const rawOrder: OrderWithProductsAndClient[] | false = await ordersRepository.get(orderId);

        // console.log(rawOrder);

        if(!rawOrder || rawOrder.length === 0) {
            return {
                success: false,
                message: "Failed to get order."
            };
        }

        const order: Order = {
            id: rawOrder[0]!.id,
            declared_value: rawOrder[0]!.declared_value,
            entry_value: rawOrder[0]!.entry_value,
            final_value: rawOrder[0]!.final_value,
            created_at: rawOrder[0]!.created_at,
            delivery_date: rawOrder[0]!.delivery_date,
            client_name: rawOrder[0]!.client_name,
            products: []
        };

        for (const row of rawOrder) {
            order.products.push({
                id: row.product_id,
                name: row.product_name,
                qty: row.product_qty
            });
        }

        return {
            success: true,
            message: "Succcess to get order.",
            data: order
        };;
    }

    async addProduct(orderId: number, productId: number, qty: number): Promise<Response> {

        const subtractResult = await productsService.decrease(productId, qty);

        if(!subtractResult.success) {
            return subtractResult;
        }

        const addResult = await ordersRepository.addProduct(orderId, productId, qty);

        if(!addResult) {
            return {
                success: false,
                message: "Failed to add product to order."
            };
        }

        return {
            success: true,
            message: "Success to add product to order."
        };;
    }

    async increaseProduct(orderId: number, productId: number, qty: number): Promise<Response> {

        const decreaseResult = await productsService.decrease(productId, qty);

        if(!decreaseResult.success) {
            return decreaseResult;
        }

        const sumResult = await ordersRepository.increaseProduct(orderId, productId, qty);

        if(!sumResult) {
            return {
                success: false,
                message: "Failed to sum product to order_product."
            } as Response;
        }

        return {
            success: true,
            message: ""
        } as Response;;
    }

    async decreaseProduct(orderId: number, productId: number, qty: number): Promise<Response> {
        const sumResult = await productsService.increase(productId, qty)

        if(!sumResult) {
            return {
                success: false,
                message: "Failed to add product to products."
            };;
        }

        const decreaseResult = await ordersRepository.decreaseProduct(orderId, productId, qty);

        if(!decreaseResult) {
            return {
                success: false,
                message: "Failed to decrease product to order."
            };;
        }

        return {
            success: true,
            message: "Success to decrease product to order."
        }
    }

    async removeProduct(orderId: number, productId: number, qty: number) : Promise<Response> {

        const increaseResult = await productsService.increase(productId, qty);

        if(!increaseResult.success) {
            return increaseResult;
        }

        return {
            success: true,
            message: "Success to remove product to order."
        };
    }
}

export const ordersService = new OrdersService();
