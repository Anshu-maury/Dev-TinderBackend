const express = require("express");
const {validateSignUpData} = require("../utils/validation")
const User = require("../models/user");
const bcrypt = require("bcrypt");
const authRouter = express.Router();

authRouter.post("/signup",async(req,res) => {
    try{
        // validation of data
        validateSignUpData(req);
        // Encrypt the passoword
        const {firstName,lastName,emailId,password,photoUrl} = req.body;
        console.log(firstName)
        const passwordHash = await bcrypt.hash(password,10);
    // Creating a new instance of the User Model
    const user = new User({
        firstName,
        lastName,
        emailId,
        password: passwordHash,
        photoUrl
    });
    const savedUser = await user.save();           //return a promise (save method)
    const token = await savedUser.getJWT();
        // Add the token to cookie and send the repsonse back to the user
        res.cookie("token",token,{
            expires:new Date(Date.now() + 8 *3600000)
        })   

    res.json({message:"User added sucessfully", data: savedUser});
    }
    catch(err){
        res.status(400).send("Error saving the user:" + err.message);
    }
})

authRouter.post("/login",async(req,res) =>{
    try{
    const {emailId,password}= req.body;
    const user = await User.findOne({emailId:emailId});
    if(!user){
        throw new Error("Invalid Credential");
    }
    const ispassowrdValid= await user.validatePassword(password);
    if(ispassowrdValid){
        // Create a JWT token
        const token = await user.getJWT();
        // Add the token to cookie and send the repsonse back to the user
        res.cookie("token",token,{
            expires:new Date(Date.now() + 8 *3600000)
        })    //saving the cookie
        res.send(user)
    }
    else{
        res.send("Invalid Credential")
    }
}catch(err){
    res.status(400).send("ERROR:" + err.message)
}
})

authRouter.post("/logout",async(req,res) => {
    res.cookie("token",null,{
        expires: new Date(Date.now()),
    });
    res.send("Logout sucessfully");
})


module.exports = authRouter;