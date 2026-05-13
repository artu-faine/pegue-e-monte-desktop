import { knex } from "../schema";

export type Order = {
    id: number,
    declared_value: number,
    entry_value: number,
    final_value: number,
    created_at: Date,
    delivery_date: Date,
}

/** Campos gravados por `update` na tabela `orders` (evita import circular com `ordersService`). */
export interface OrderRepositoryUpdate {
    delivery_date: Date;
    declared_value: number;
    entry_value: number;
    final_value: number;
}

export type OrderWithProductAndClient = Order &
    OrderProductInfo &
    OrderClientInfo

type OrderProductInfo = {
    product_id: number;
    product_name: string;
    product_qty: number;
  };

  type OrderClientInfo = {
    client_name: string;
  };

export class OrdersRepository {
    async getAll(orderId: number): Promise<OrderWithProductAndClient[] | false> {
        try {
            // const result = await knex('orders as o')
            //     .join('order_products as op', 'o.id', 'op.order_id')
            //     .join('products as p', 'p.id', 'op.product_id')
            //     .join('clients as c', 'o.client_id', 'c.id')
            //     .where('o.id', orderId)
            //     .select(
            //         'o.id',
            //         'o.declared_value',
            //         'o.entry_value',
            //         'o.final_value',
            //         'o.created_at',
            //         'o.delivery_date',
            //         'op.product_id as product_id',
            //         'p.name as product_name',
            //         'c.name as client_name',
            //         'op.product_qty'
            //     );

            const result = knex.select("*").from("orders");

            return result;
        } catch {
            return false;
        }
    }

    async get(orderId: number): Promise<OrderWithProductAndClient[] | false> {
        try {
            const result = await knex('orders as o')
                .join('order_products as op', 'o.id', 'op.order_id')
                .join('products as p', 'p.id', 'op.product_id')
                .join('clients as c', 'o.client_id', 'c.id')
                .where('o.id', orderId)
                .select(
                    'o.id',
                    'o.declared_value',
                    'o.entry_value',
                    'o.final_value',
                    'o.created_at',
                    'o.delivery_date',
                    'op.product_id as product_id',
                    'p.name as product_name',
                    'c.name as client_name',
                    'op.product_qty'
                );

            return result;
        } catch {
            return false;
        }
    }

    async update(order: OrderRepositoryUpdate): Promise<boolean> {
        try {
            await knex("orders").update({
                delivery_date: order.delivery_date,
                declared_value: order.declared_value,
                entry_value: order.entry_value,
                final_value: order.final_value,
            });

            return true;
        } catch {
            return false;
        }
    }

    async addProduct(orderId: number, productId: number, qty: number): Promise<boolean> {
        try {
            await knex("order_products").insert({
                order_id: orderId,
                product_id: productId,
                product_qty: qty
            });

            return true;
        } catch {
            return false;
        }
    }

    async increaseProduct(orderId: number, productId: number, qty: number): Promise<boolean> {
        try {
            await knex("order_products")
                .where("order_id", orderId)
                .where("product_id", productId)
                .increment("product_qty", qty);

            return true;
        } catch {
            return false;
        }
    }

    async decreaseProduct(orderId: number, productId: number, qty: number): Promise<boolean> {
        try {
            await knex("order_products")
                .where("order_id", orderId)
                .where("product_id", productId)
                .decrement("product_qty", qty);

            return true;
        } catch {
            return false;
        }
    }
}

export const ordersRepository = new OrdersRepository();
