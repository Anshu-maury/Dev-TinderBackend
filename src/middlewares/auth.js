const jwt = require("jsonwebtoken");
const User = require("../models/user");
const userAuth = async(req,res,next) => {
    // Read the token from the req cookies
    try{
    const {token} = req.cookies;
    if(!token){
        return res.status(401).send("Please Login!!!!")
    }
    //validate the token
    const decodedObj = await jwt.verify(token,"Muskan@20");
    const {_id} = decodedObj;
    //Find the user
    const user = await User.findById(_id);
    if(!user){
        throw new Error("User not found")
    }
    req.user = user;
    next();
}
    catch(err){
        res.status(400).send("Error:" + err.message)
    }
    
}
module.exports = {userAuth};