import { knex } from "../schema";

export class ProductsRepository {
    async subtractProduct(productId: number, qty: number): Promise<boolean> {
        try {
            await knex("products").where("id", productId).decrement("qty", qty);
            return true;
        } catch {
            return false;
        }
    }

    async sumProduct(productId: number, qty: number): Promise<boolean> {
        try {
            await knex("products").where("id", productId).increment("qty", qty);
            return true;
        } catch {
            return false;
        }
    }
}

export const productsRepository = new ProductsRepository();
