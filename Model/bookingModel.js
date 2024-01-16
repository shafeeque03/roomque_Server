const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Types.ObjectId,
    ref: "owner",
    required: true,
  },
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "user",
    required: true,
  },
  roomId: {
    type: mongoose.Types.ObjectId,
    ref: "room",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  cancelExp:{
    type: Date,
    required: true,
  },
  isCancelled: {
    type: Boolean,
    default: false,
  },
  room: {
    roomName: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    acType: {
      type: String,
      requires: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
});

const booking = mongoose.model("booking", bookingSchema);
module.exports = booking;
