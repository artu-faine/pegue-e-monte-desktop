import { app, BrowserWindow, ipcMain } from "electron";
// import knex from "knex";
import { knex } from "../schema";

    export function productController() : void {
        ipcMain.on("sendMsg", function (event: any, msg: string) {
            console.log(msg);
        });

        console.log("Test ts");

        ipcMain.on("clicked", function (event: any, msg: string) {
            console.log(msg);
        });

        ipcMain.on("products:insert", function (event: any, name: string) {
            let result = knex("clients").insert({name: name});

            result.then(function(rows: number[]) {
                console.log("Nome Criado");
            });
        });
    }