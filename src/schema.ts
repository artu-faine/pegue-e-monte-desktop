import type { Knex } from "knex";
import knexLib from "knex";
import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";

const isDev = !app.isPackaged;
const dbPath = isDev ? path.join(__dirname, "database.sqlite") : path.join(app.getPath("userData"), "database.sqlite");

console.log(dbPath);
console.log(path.join(app.getPath("userData"), "database.sqlite"));

export const knex = knexLib({
  client: "better-sqlite3",
  connection: {
    filename: dbPath
  }
});

knex.schema.hasTable('products').then(function(exists: boolean) {
    if (!exists) {
        return knex.schema.createTable('products', function(table: Knex.TableBuilder) {
            table.increments('id').primary();
            table.string('name').notNullable();
            table.integer('qty').notNullable();
            table.string('theme');
            table.timestamp('created_at').defaultTo(knex.fn.now());
        });
    }
});

knex.schema.hasTable('clients').then(function(exists: boolean) {
    if (!exists) {
        return knex.schema.createTable('clients', function(table: Knex.TableBuilder) {
            table.increments('id').primary();
            table.string('name').notNullable();
            table.text('address');
            table.string('cpf');
            table.string('phone');
            table.string('phone_2');
            table.timestamp('created_at').defaultTo(knex.fn.now());
        });
    }
});

knex.schema.hasTable('orders').then(function(exists: boolean) {
    if (!exists) {
        return knex.schema.createTable('orders', function(table: Knex.TableBuilder) {
            table.increments('id').primary();

            table.integer('client_id')
                .unsigned()
                .notNullable()
                .references('id')
                .inTable('clients')
                .onDelete('CASCADE');

            // table.enum('status', ["completed", "in_progress", "late"]).notNullable();
            table.date('date').notNullable();
            table.date('delivery_date');
            table.integer('declared_value').notNullable();
            table.integer('entry_value');
            table.integer('final_value');
            table.timestamp('created_at').defaultTo(knex.fn.now());
        });
    }
});

knex.schema.hasTable('order_products').then(function(exists: boolean) {
    if (!exists) {
        return knex.schema.createTable('order_products', function(table: Knex.TableBuilder) {

            table.integer('order_id')
                .unsigned()
                .notNullable()
                .references('id')
                .inTable('orders')
                .onDelete('CASCADE');

            table.integer('product_id')
                .unsigned()
                .notNullable()
                .references('id')
                .inTable('products')
                .onDelete('CASCADE');

            table.integer('product_qty').notNullable().unsigned();
            table.timestamp('created_at').defaultTo(knex.fn.now());
        });
    }
});