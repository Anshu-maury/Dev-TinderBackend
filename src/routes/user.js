const express = require("express");
const userRouter = express.Router();
const {userAuth} =require("../middlewares/auth");
const ConnectionRequestModel = require("../models/connectionRequest");
const User = require("../models/user");
const USER_SAFE_DATA= "firstName lastName age gender about skills"
//Get all the pending connection Request for the loggedIn user
userRouter.get("/user/requests/received",userAuth,async(req,res) => {
    try{
        const loggedInUser = req.user;
        const connectionRequests = await ConnectionRequestModel.find({
            toUserId:loggedInUser._id,
            status:"interested",
        }).populate("fromUserId",USER_SAFE_DATA)
        res.json({
            message:"Data fetched successfully",
            data:connectionRequests
        })
    }
    catch(err){
        res.status(400).send("ERROR :" + err.message)
    }
})

userRouter.get('/user/connections',userAuth,async(req,res) =>{
    try{
        const loggedInUser = req.user;
        const connectionRequests =await ConnectionRequestModel.find({
            $or:[
                {toUserId:loggedInUser._id,status:"accepted"},
                {fromUserId:loggedInUser._id,status:"accepted"}
            ]
        })
        .populate("fromUserId",USER_SAFE_DATA)
        .populate("toUserId",USER_SAFE_DATA)
        // console.log(connectionRequests);

        const data = connectionRequests.map((row) => {
            if(row.fromUserId._id.toString() === loggedInUser._id.toString()){
               return row.toUserId;
            }
            return row.fromUserId;
        });
        res.json({data});
    }
    catch(err){
        res.status(400).send({message:err.message})
    }
})

userRouter.get('/user/feed',userAuth,async(req,res) => {
    try{
        //User should see all the user cards except
            // 0.his own cards
            // 1. his connections
            // 2. ignored people
            // 3. already sent the connection request
            // Example Rahul[new user] = [Mark,Donald,Dhoni,Virat]
                // Rahul--> Akshay --> rejected    Rahul --> Elon ---> accepted
                // Rahul willonly see the profile of Mark,donald,dhoni,virat
            const loggedInUser= req.user;
            const page =parseInt(req.query.page) || 1;
            let limit =parseInt(req.query.limit) || 10;
            limit = limit > 50 ? 50 : limit;
            const skip = (page-1)*limit
            // find all the connection request (sent+received)
            const connectionRequests = await ConnectionRequestModel.find({
                $or:[{fromUserId:loggedInUser._id}, {toUserId:loggedInUser._id}],
            }).select("fromUserId toUserId");

            const hideUsersFromFeed = new Set();
            connectionRequests.forEach((req) => {
                hideUsersFromFeed.add(req.fromUserId.toString());
                hideUsersFromFeed.add(req.toUserId.toString());
            })
// DB call --find all the profile which is not present in hideUsersFromFeed array
            const users = await User.find({
               $and:[
                {_id:{$nin:Array.from(hideUsersFromFeed)}},  //it will convert the set into array
                {_id:{$ne:loggedInUser._id}},  
               ],
            }).select(USER_SAFE_DATA).skip(skip).limit(limit)
            res.json({data :users});   
    }
    catch(err){
        res.status(400).json({message:err.message})
    }
})

module.exports = userRouter;