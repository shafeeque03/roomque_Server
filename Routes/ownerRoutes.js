const express = require('express')
const ownerRoute = express();
const ownerController = require("../Controller/ownerController")
const multer = require('multer')
const verification = require("../middleware/authVerify")

const storage = multer.memoryStorage();
const imageFilter = function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/)) {
      req.fileValidationerror = 'Only image files are allowed!';
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
const upload = multer({ storage: storage, fileFilter: imageFilter });

ownerRoute.post('/signup',ownerController.insertOwner)
ownerRoute.post('/otp',ownerController.otpVerifying)
ownerRoute.post('/login',ownerController.verifyLogin)
ownerRoute.post('/resendOtp',ownerController.resendOtp)
ownerRoute.post('/addRoom',ownerController.addRoom)
ownerRoute.get('/:ownerId', ownerController.getMyRoom);
ownerRoute.get('/myRoom/:roomId', verification.ownerTokenVerify, ownerController.getMyRoomDetail);
ownerRoute.get('/myBookings/:ownerId',ownerController.myBookingss)
ownerRoute.put('/editRoom', ownerController.editRoom);
ownerRoute.patch('/deleteImage', ownerController.deleteRoomImage);
ownerRoute.patch('/blockRoom', ownerController.roomBlock);
ownerRoute.post('/forgotPassword', ownerController.forgotPassword)
ownerRoute.patch('/verifyPassword', ownerController.setNewPassword)



module.exports = ownerRoute