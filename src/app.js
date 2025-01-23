const express = require("express");
const {connectDb} = require("./config/database");
const cookieParser = require("cookie-parser");
const app = express();
app.use(express.json());   //its a middleware which reads the json object and converts it into js object and it add that object to the req body
app.use(cookieParser());
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile")
const requestRouter = require("./routes/requests")

app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/",requestRouter);




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