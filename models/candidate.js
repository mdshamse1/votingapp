const mongoose = require('mongoose');
const { type } = require('os');
// const bcrypt = require('bcrypt');
// Define user schema 
const candidateSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true
    },
   party:{
    type:String,
    required:true
   },
   age:{
    type:Number,
    required:true
   },
   votes:[
    {
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'user',
            required:true
        },
        votedAt:{
            type:Date,
            default:Date.now()
        }
    }
   ],
   voteCount:{
    type:Number,
    default:0
   }

});


// create user model 
const  candidate = mongoose.model("candidate",candidateSchema);
module.exports = candidate;