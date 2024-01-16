const mongoose = require('mongoose')

const ownerSchema = new mongoose.Schema({
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
      
      
});

const owner = mongoose.model("owner", ownerSchema);
module.exports = owner;