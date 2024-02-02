const express = require('express')
const userRoute = express();
const userController = require('../Controller/userController')
const verification = require("../middleware/authVerify")


userRoute.post('/signup',userController.insertUser)
userRoute.post('/otp',userController.otpVerifying)
userRoute.post('/resendOtp',userController.resendOtp)
userRoute.post('/login', userController.verifyLogin)
userRoute.get('/', userController.roomList)
userRoute.get('/roomDetails/:roomId',userController.roomDetails)
userRoute.get('/myBookings/:userId',userController.myBookings)
userRoute.post('/fPassword',userController.forgotPassword)
userRoute.patch('/verifyPasswordUser', userController.setNewPassword)
userRoute.put('/editProfile', userController.editProfile)
userRoute.post('/bookRoom',userController.bookRoom)
userRoute.post('/cancelBooking',userController.cancelBooking)
userRoute.post('/getLocationData',userController.searchedLocation)
userRoute.post('/postReview',userController.reviewAndRating)
userRoute.post('/myRatings',userController.myRatingss)
userRoute.post('/paymentCheckout', userController.paymentCheckout)
userRoute.post('/getRatingsss', userController.getRatings)
userRoute.post('/checkAvailable', userController.checkRoomAvailability)
userRoute.post('/applyFilter', userController.filteredRoomss)
userRoute.post('/walletPay', userController.payByWallett)


module.exports = userRoute
