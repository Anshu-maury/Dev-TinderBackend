const express = require("express");
const {adminAuth} = require("./middlewares/auth")
const {connectDb} = require("./config/database")
const app = express();

    connectDb()
    .then(() => {
        console.log("Database connected");
        app.listen(8000,() => {
            console.log("server is runnining 3000")
        });
        })
    .catch((err) => {
        console.error("Database not connected")
    })