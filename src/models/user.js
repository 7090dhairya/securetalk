const { Timestamp } = require("bson")
const mongoose = require("mongoose")


let userschema = new mongoose.Schema({
   email : {
    type : String,
    required : true,
    unique  : true,
   },
   password: {
    type: String,
    required: true,
   },
  
},
 {
    timestamps: true
   }
)


module.exports = mongoose.model("user", userschema)
