const mongoose =require("mongoose");
const validator = require('validator');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        minLength:4
    },
    lastName:{
        type:String
    },
    emailId:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid email Address " + value);
            }
        },
    },
    password:{
        type:String,
        required:true,
        validate(value){
            if(!validator.isStrongPassword(value)){
                throw new Error("Invalid password "+value)
            }
        }
    },
    age:{
        type:Number,
        min:18
    },
    gender:{
        type:String,
        enum: {
            values:["male","female","others"],
            message:`{VALUE} is not a valud gender type`
        }
        // Custom validation
        // validate(value){     //this validation function willwork on only new document not on the older documenet
        //     if(!["male","female","others"].includes(value)){
        //         throw new Error("Gender data is not valid")
        //     }
        // }
    },
    photoUrl:{
        type:String,
        default:"https://media.istockphoto.com/id/1164157572/vector/business-woman-silhouette-profile-sign-vector-female-flat-icon-women-head-and-face-lady-user.jpg?s=1024x1024&w=is&k=20&c=aQ4cm9RqIMaeKVaYkQT62ZKWvI_wMfglsMZlcRSnVEo="
    },
    about:{
        type:String,
        default:"This is the default about of user"
    },
    skills:{
        type:[String],         //Array of strings
    },
},
    {
        timestamps:true,
    }
);

// Schema Methods
userSchema.methods.getJWT = async function (){
    const user = this;
    const token = await jwt.sign({_id:user._id},"Muskan@20",{expiresIn:"7d"});
    return token;
}

userSchema.methods.validatePassword = async function (passwordInputByUser){
    const user = this;
    const passwordHash = user.password;
    const isPasswordValid =await bcrypt.compare(passwordInputByUser,passwordHash);
    return isPasswordValid;
}

const User = mongoose.model("User",userSchema);
module.exports = User;