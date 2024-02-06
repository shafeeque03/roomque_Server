const mongoose = require("mongoose");
require("dotenv").config()

module.exports = {
    dbconnect:()=>{
        mongoose.connect(process.env.MONGO_URL)
        .then(()=>{
            console.log("DB Connected");
        })
        .catch((err)=>{
            console.log(err);
        })
    }
}