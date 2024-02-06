const mongoose = require("mongoose");
require("dotenv").config()

module.exports = {
    dbconnect: () => {
        console.log("Connecting to MongoDB:", process.env.MONGO_URL);
        mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => {
            console.log("DB Connected");
        })
        .catch((err) => {
            console.log("Error connecting to MongoDB:", err);
        });
    }
};
