const express = require("express");
const {adminAuth} = require("./middlewares/auth")
const {connectDb} = require("./config/database");
const bcrypt = require("bcrypt");
const {validateSignUpData} = require("./utils/validation")
const User = require("./models/user");
const cookieParser = require("cookie-parser");
const jwt =require("jsonwebtoken");
const app = express();
     app.use(express.json());   //its a middleware which reads the json object and converts it into js object and it add that object to the req body
     app.use(cookieParser());
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
    app.post("/login",async(req,res) =>{
        try{
        const {emailId,password}= req.body;
        const user = await User.findOne({emailId:emailId});
        if(!user){
            throw new Error("Invalid Credential");
        }
        const ispassowrdValid= await bcrypt.compare(password,user.password);
        if(ispassowrdValid){
            // Create a JWT token
            const token = await jwt.sign({_id:user._id},"Muskan@20")
            // Add the token to cookie and send the repsonse back to the user
            res.cookie("token",token)    //saving the cookie
            res.send("login sucessfully")
        }
        else{
            res.send("Invalid Credential")
        }
    }catch(err){
        res.status(400).send("ERROR:" + err.message)
    }
    })

    app.get("/profile",async(req,res) => {
        try{
        const cookies = req.cookies;
        const {token} = cookies;
        if(!token){
            throw new Error("Invalid Token")
        }

        // Validate the token
        const decodedMessage = await jwt.verify(token,"Muskan@20");
        const {_id} = decodedMessage;
        console.log("Logged in user is "+ _id);
        const user =await User.findById({_id});
        if(!user){
            throw new Error("User not found")
        }
        res.send(user)
    }
    catch(err){
        res.status(400).send("Error: " + err.message)
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