const mongoose =require("mongoose");
const validator = require('validator');
const userSchema = mongoose.Schema({
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
        // Custom validation
        validate(value){     //this validation function willwork on only new document not on the older documenet
            if(!["male","female","others"].includes(value)){
                throw new Error("Gender data is not valid")
            }
        }
    },
    photoUrl:{
        type:String,

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

const User = mongoose.model("User",userSchema);
module.exports = User;