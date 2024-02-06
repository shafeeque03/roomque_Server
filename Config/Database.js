const mongoose = require("mongoose");
require("dotenv").config()

module.exports = {
    dbconnect:()=>{
        const dbOptions = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
          };
        mongoose.connect(process.env.MONGO_URL,dbOptions)
        .then(()=>{
            console.log("DB Connected");
        })
        .catch((err)=>{
            console.log(err);
        })
    }
}