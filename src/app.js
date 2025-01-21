const express = require("express");
const {adminAuth} = require("./middlewares/auth")
const {connectDb} = require("./config/database")
const User = require("./models/user")
const app = express();

    app.post("/signup",async(req,res) => {
        // Creating a new instaance of the User Model
        const user = new User({
            firstName:"Muskan",
            lastName:"Maurya",
            emailId:"muskan@gmail.com",
            password:"muskan123"
        });
        try{
        await user.save();           //return a promise (save method)
        res.send("User added sucessfully")
        }
        catch(err){
            res.status(400).send("Error saving the user:" + err.message);
        }
    })
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