import { knex } from "../schema";

export interface Product {
    id: number,
    name: string,
    qty: number,
    theme: string | null,
    // created_at: Date
}

export type NewProduct = Pick<Product, "name" | "qty"> &
    Partial<Pick<Product, "theme">>;

export class ProductsRepository {
    async set(product: NewProduct): Promise<number | false> {
        try {
            const [productId] = await knex("products").insert({
                name: product.name,
                qty: product.qty,
                theme: product.theme ?? "",
            });

            if (!productId) {
                return false;
            }

            return productId;
        } catch {
            return false;
        }
    }

    async update(product: Product) Promise<Product | boolean> {
        try{
            return knex("products").where("id", product.id).update(product);
        } catch {
            return false;
        }
    }

    async decrease(productId: number, qty: number): Promise<boolean> {
        try {
            await knex("products").where("id", productId).decrement("qty", qty);
            return true;
        } catch {
            return false;
        }
    }

    async increase(productId: number, qty: number): Promise<boolean> {
        try {
            await knex("products").where("id", productId).increment("qty", qty);
            return true;
        } catch {
            return false;
        }
    }

    async getProduct(productId: number): Promise<Product | false> {
        try {
            const product = await knex("products").where("id", productId).first();
            return product;
        } catch {
            return false;
        }
    }

    async getAllProducts(): Promise<Product[]> {
        try {
            const product = await knex("products");
            return product;
        } catch {
            return false;
        }
    }

    async getProductInOrder(productId: number): Promise<{ order_id: number; product_id: number }[] | false> {
        try {
            return await knex("order_products")
                .where("product_id", productId)
                .select("order_id", "product_id");
        } catch {
            return false;
        }
    }

    async delete(productId: number): Promise<boolean> {
        try {
            await knex("products").where("id", productId).del();
            return true;
        } catch {
            return false;
        }
    }
}

export const productsRepository = new ProductsRepository();
