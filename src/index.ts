import { knex } from "./schema";
import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { productController } from "./controllers/productsController";
import { ordersService } from "./services/ordersService";

app.whenReady().then(() => {
    let mainWindow = new BrowserWindow({
        height: 800,
        width: 800,
        webPreferences: {
            preload : path.join(__dirname, "preload.js")
        }
    });

    mainWindow.loadFile(path.join(__dirname, "../src/views/main.html"));
    mainWindow.once("ready-to-show", () => { mainWindow.show() });

    ipcMain.on("mainWindowLoaded", function () {
        let result = knex.select("name").from("clients");

        result.then(function (rows: Array<{name: string}>) {
            console.log("Registros encontrados:", rows);
            mainWindow.webContents.send("resultSend", rows);
        });

        ordersService.getOrder(1).then(order => {
            console.log('Busca do Pedido: ', order);
        });

        // let result2 = knex("users").insert({name: "teste1"}, ["name"]);
        // let result2 = knex("users").where({id: 1}).update({name: 'teste2'});
        // let result2 = knex("users").where({id: 1}).del();

        // const result2 = knex('orders as o')
        //     .join('order_products as op', 'o.id', 'op.order_id')
        //     .join('products as p', 'p.id', 'op.product_id')
        //     .where('o.id', 1)
        //     .select(
        //         'o.id',
        //         'p.name',
        //         'op.product_qty'
        // );

        // result2.then(function (rows: any[]) {
        //     console.log(rows);
        //     // console.log(result2);
        // });
    });

    // ipcMain.on("sendMsg", function (event: any, msg: string) {
    //     console.log(msg);
    // });

    productController();
});