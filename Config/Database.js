const mongoose = require("mongoose");
require("dotenv").config()

// module.exports = {
    const dbconnect = ()=>{
        mongoose
    .connect("mongodb+srv://roomque:newBooking@roomquecluster.qwe342w.mongodb.net/roomque", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Database connected successfully");
    })
    .catch((err) => {
      console.log("Error for connecting DB",err);
    });
    }
// }
// this.dbconnect()
dbconnect()