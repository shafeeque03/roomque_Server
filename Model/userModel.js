const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      number: {
        type: Number,
        required: true,
      },
      password: {
        type:String,
        required:true
      },
      is_blocked: {
        type: Boolean,
        default:false
      },
      is_verified:{
        type: Boolean,
        default: false
      },
      wallet: {
        type: Number, 
        default: 0
      },
      profilePhoto: {
        type: String
      }
});

const user = mongoose.model("user", userSchema);
module.exports = user;