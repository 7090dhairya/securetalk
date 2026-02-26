const mongoose = require("mongoose")


const connectdb = async ()=>{
    try {
        await mongoose.connect( process.env.MONGO_URI)
        console.log("database connected")
        
    }
    catch(err){
           console.log("could cannot connect to the data base",err)
        process.exit(1)
    }
}

module.exports = connectdb