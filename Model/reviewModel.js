const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
  userId: mongoose.Types.ObjectId,
  roomId: mongoose.Types.ObjectId,
  userName: String,
  rating: Number,
  review: String
})

const reviewModel = mongoose.model("review",reviewSchema)
module.exports = reviewModel