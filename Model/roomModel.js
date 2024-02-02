const mongoose = require('mongoose')

const roomSchema = new mongoose.Schema({
    roomName: {
        type: String,
        required: true,
      },
      rent: {
        type: Number,
        required: true,
      },
      is_blocked: {
        type: Boolean,
        default:false
      },
      is_available:{
        type: Boolean,
        default: true
      },
      ownerId: {
        type: mongoose.Types.ObjectId,
        ref: "owner",
        required: true,
      },
      about:{
        type: String,
        required: true
      },
      phone:{
        type: Number,
        required: true 
      },
      location:{
        type: String,
        required: true
      },
      roomType:{
        type: String,
        required: true
      },
      model:{
        type: String,
        required : true
      },
      isBooked:{
        type: Boolean,
        default: false
      },
      acType :{
        type : String,
        required: true
      },
      roomImages: {
        type: Array,
        // required: true,
      },
      
});

const room = mongoose.model("room", roomSchema);
module.exports = room;