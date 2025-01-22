const express = require("express");
const {adminAuth} = require("./middlewares/auth")
const {connectDb} = require("./config/database");
const bcrypt = require("bcrypt");
const {validateSignUpData} = require("./utils/validation")
const User = require("./models/user")
const app = express();
     app.use(express.json());   //its a middleware which reads the json object and converts it into js object and it add that object to the req body
    app.post("/signup",async(req,res) => {
        try{
            // validation of data
            validateSignUpData(req);
            // Encrypt the passoword
            const {firstName,lastName,emailId,password} = req.body;
            const passwordHash = await bcrypt.hash(password,10);
        // Creating a new instance of the User Model
        const user = new User({
            firstName,
            lastName,
            emailId,
            password: passwordHash,
        });
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
    app.patch("/user/:userId",async(req,res) => {
        // const userId = req.body._id;
        const userId = req.params?.userId;
        const data = req.body;
        // console.log(data)
        try{
            const ALLOWED_UPDATES = [
                "photoUrl",
                "about",
                "gender",
                "age",
                "skills"
            ]
            const isUpdatedAllowed =Object.keys(data).every((k) => ALLOWED_UPDATES.includes(k));
        if(!isUpdatedAllowed){
            throw new Error("Update not Allowed")
        }
        if(data?.skills.length > 10){
            throw new Error("Skills cannot be more than 10")
        }
          const user = await User.findByIdAndUpdate(userId,data,{returnDocument:'after',runValidators:true});  
            res.send("User updated sucessfully")
        }catch(err){
            res.status(400).send("something went wrong"+ err.message)
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