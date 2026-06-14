import { knex } from "../schema";

export type Order = {
    id: number,
    client_id: number,
    // date: Date,
    declared_value: number,
    entry_value: number | null,
    final_value: number | null,
    created_at: Date,
    delivery_date: Date | null,
}

type OrderUpdatableFields =
  | "delivery_date"
  | "declared_value"
  | "entry_value"
  | "final_value"
  | "created_at";

/** Campos gravados por `update` na tabela `orders` (evita import circular com `ordersService`). */
// export interface OrderRepositoryUpdate {
//     delivery_date: Date;
//     declared_value: number;
//     entry_value: number;
//     final_value: number;
// }

export type OrderRepositoryUpdate = Partial<Pick<Order, OrderUpdatableFields>>

// export type NewOrder = {
//     client_id: number;
//     declared_value: number;
//     delivery_date?: Date | null;
//     entry_value?: number | null;
//     final_value?: number | null;
//     created_at: Date
//     // created_at: Date;
// };

// Sim, newOrder é o tipo Order sem o campo 'id'.
export type NewOrder = Omit<Order, "id" | "created_at">;

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
    async getAll(): Promise<OrderWithProductAndClient[] | false> {
        try {
            const result = await knex('orders as o')
                .join('order_products as op', 'o.id', 'op.order_id')
                .join('products as p', 'p.id', 'op.product_id')
                .join('clients as c', 'o.client_id', 'c.id')
                .select(
                    'o.id',
                    'o.declared_value',
                    'o.entry_value',
                    'o.final_value',
                    'o.created_at',
                    'o.delivery_date',
                    'op.product_id as product_id',
                    'p.name as product_name',
                    'c.id as client_id',
                    'c.name as client_name',
                    'op.product_qty'
                )
                .orderBy('o.id', 'desc');

            return result;
        } catch {
            return false;
        }
    }

    async set(order: NewOrder): Promise<number | false> {
        try {
            const [orderId] = await knex("orders").insert({
                client_id: order.client_id,
                // created_at: order.created_at,
                delivery_date: order.delivery_date ?? null,
                declared_value: order.declared_value,
                entry_value: order.entry_value ?? null,
                final_value: order.final_value ?? null,
            });

            if (!orderId) {
                return false;
            }

            return orderId;
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
                    'c.id as client_id',
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

    async delete(orderId: number): Promise<boolean> {
        try {
            await knex("orders").where("id", orderId).del();
            return true;
        } catch {
            return false;
        }
    }
}

export const ordersRepository = new OrdersRepository();
