const mongoose = require("mongoose");
require("dotenv").config();

module.exports = {
  dbconnect: () => {
    mongoose
      .connect("mongodb+srv://roomque:room100@cluster0.uyas23q.mongodb.net/roomque")
      .then(() => {
        console.log("Database connected successfully");
      })
      .catch((err) => {
        console.log("Error for connecting", err);
      });
  },
};
