const express = require("express");
const app = express();
app.use("/hello",(req,res) => {      //Request handler
    res.send("hello")
})
app.listen(8000,() => {
    console.log("server is runnining 3000")
});