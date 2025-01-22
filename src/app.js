const express = require("express");
const {adminAuth} = require("./middlewares/auth")
const {connectDb} = require("./config/database")
const User = require("./models/user")
const app = express();
     app.use(express.json());   //its a middleware which reads the json object and converts it into js object and it add that object to the req body
    app.post("/signup",async(req,res) => {
        console.log(req.body)
        // Creating a new instance of the User Model
        const user = new User(req.body);
        try{
        await user.save();           //return a promise (save method)
        res.send("User added sucessfully")
        }
        catch(err){
            res.status(400).send("Error saving the user:" + err.message);
        }
    })

    // Get user by email
    app.get("/user",async(req,res) => {
        const userEmail = req.body.emailId;
        try{
        const user = await User.find({emailId:userEmail})
        res.send(user);
        }catch(err){
            res.status(400).send("something went wrong")
        }
    })

    // Get user by id
    app.get("/user/id",async(req,res) => {
        const userId = req.body._id;
        // console.log(userId)
        try{
        const user = await User.findById({_id:userId});
        res.send(user)
        }catch(err){
            res.status(400).send("something went wrong")
        }
    })

    // feed api which get all the user
    app.get("/feed",async(req,res) => {
        try{
            const user = await User.find({})
            res.send(user);
            }catch(err){
                res.status(400).send("something went wrong")
            }
    });

    // Delete the user
    app.delete("/user",async(req,res) => {
        const id = req.body._id;
        try{ 
        const user = await User.findByIdAndDelete({_id:id})
        res.send("User deleted sucessfully")
        }catch(err){
            res.status(400).send("something went wrong")
        }
        
    })

    // Update the user
    app.patch("/user",async(req,res) => {
        const userId = req.body._id;
        const data = req.body;
        // console.log(data)
        try{
          const user = await User.findByIdAndUpdate(userId,data,{returnDocument:'after'});
          console.log(user);
            res.send("User updated sucessfully")
        }catch(err){
            res.status(400).send("something went wrong")
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