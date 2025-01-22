const express = require("express");
const {adminAuth} = require("./middlewares/auth")
const {connectDb} = require("./config/database");
const bcrypt = require("bcrypt");
const {validateSignUpData} = require("./utils/validation")
const User = require("./models/user");
const cookieParser = require("cookie-parser");
const jwt =require("jsonwebtoken");
const {userAuth} = require("./middlewares/auth")
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
            const token = await jwt.sign({_id:user._id},"Muskan@20",{expiresIn:"7d"})
            // Add the token to cookie and send the repsonse back to the user
            res.cookie("token",token,{
                expires:new Date(Date.now() + 8 *3600000)
            })    //saving the cookie
            res.send("login sucessfully")
        }
        else{
            res.send("Invalid Credential")
        }
    }catch(err){
        res.status(400).send("ERROR:" + err.message)
    }
    })

    app.get("/profile",userAuth,async(req,res) => {
        try{
       const user = req.user;
        res.send(user)
    }
    catch(err){
        res.status(400).send("Error: " + err.message)
    }
    })
    app.post("/sendConnectionRequest",userAuth,(req,res)=> {
        console.log("Sending the connection request");
        res.send("Connection request send");
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