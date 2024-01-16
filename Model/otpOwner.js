const mongoose = require('mongoose')

const otpOwnerSchema = new mongoose.Schema({
  ownerId: mongoose.Types.ObjectId,
  otp: String,
  createdAt: Date,
  expiresAt: Date

})

const OwnerOtpModel = mongoose.model("Ownerotp",otpOwnerSchema)
module.exports = OwnerOtpModel