const express = require("express");
const {userAuth} = require("../middlewares/auth");
const ConnectionRequestModel = require("../models/connectionRequest");
const User = require("../models/user")
const requestRouter = express.Router();

requestRouter.post("/request/send/:status/:toUserId",userAuth,async(req,res)=> {
    try{
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;
        const allowedStatus =["ignored","interested"];
        if(!allowedStatus.includes(status)){
            return res.status(400)
            .json({message:"Invalid status type: " + status});
        }
//If receiver(to userid) is not present in db.
        const toUser = await User.findById(toUserId);
        if(!toUser){
            return res.status(404).json({
                message:"User not found"
            });
        }
        const existingConnectionRequest =await ConnectionRequestModel.findOne({
            $or:[
                {fromUserId,toUserId},  //fromuserId and touserId already exits in connectionrequestmodel
                {fromUserId:toUserId,toUserId:fromUserId} //
            ] 
        })
        if(existingConnectionRequest){
            return res
               .status(400)
               .send({message:"Connection Request already exists"});
        }

        // Created the new instance of connection request model
        const connectionRequest = new ConnectionRequestModel({
            fromUserId,
            toUserId,
            status,
        })
        const data = await connectionRequest.save();
        res.json({
            message:req.user.firstName+" is " + status+ "in " + toUser.firstName,
            data,
        });

    }
    catch(err){
        res.status(400).send("ERROR :" + err.message)
    }
})

requestRouter.post("/request/review/:status/:requestId",userAuth,async(req,res) => {
    try{
        // check the loogedIn user somebody is looged in
        const loggedInUser = req.user;
        const {status,requestId} = req.params;
        
        const allowedStatus = ["accepted","rejected"];
        if(!allowedStatus.includes(status)){
            return res.status(400).json({message:"Status not allowed"})
        }

        const connectionRequest =await ConnectionRequestModel.findOne({
            _id:requestId,
            toUserId:loggedInUser._id,
            status:"interested"
        });
        if(!connectionRequest){
            return res
            .status(404)
            .json({message:"Connection request not found"});
        }
// If connection request found
        connectionRequest.status = status;
        const data =await connectionRequest.save();
        res.json({message:"Connection request " + status,data});
        // validate the status
        // Akshay => Elon
        // loggedInUser === toUserId
        // status = interested
        // requestId should be vaalid present in db
    }catch(err){
        res.status(400).send("ERROR : " + err.message)
    }
})

module.exports = requestRouter;