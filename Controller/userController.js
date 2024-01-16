const User = require("../Model/userModel")
const Booking = require("../Model/bookingModel")
const bcrypt = require("bcrypt")
const nodemailer = require("nodemailer")
const {json} = require("express")
const dotenv = require("dotenv")
const otpModel = require("../Model/otpModel")
const jwt = require('jsonwebtoken')
const Room = require("../Model/roomModel")
const { userBlock } = require("./adminController")
dotenv.config()

var otpId;

const sendVerifymail = async (name, email,userId) => {
    try {
      console.log(name, email, userId, "datas on verifymail");
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      const otp = Math.floor(1000 + Math.random() * 9000);


      const mailOption = {
        from: "ptshafeeque999.com",
        to: email,
        subject: "For OTP verification",
        text: `Your OTP is: ${otp}`,
        html: `
        <html>
            <body style = "backgroundColor":blue>
                <p style="color:#2A5948">Hello,${name}</p>
                <h3 style="color:#2A5948">Your OTP for verification is: <span style="font-weight: bold; color: #3498db;">${otp}</span></h3>
                <p style="color:#2A5948">If you didn't request this OTP or need further assistance, please contact us at support@example.com.</p>
            </body>
        </html>
    `
      };
      const verificationOtp = new otpModel({
        userId:userId,
        otp:otp,
        createdAt:Date.now(),
        expiresAt:Date.now()+300000
      })

      let verified = await verificationOtp.save()
  
      transporter.sendMail(mailOption, (error, info) => {
        if (error) {
          console.log(error.message);
        } else {
          console.log(otp + "," + "email has been send to:", info.response);
        }
      });

      return verified._id

    } catch (error) {
      console.log(error.message);
    }
  };


const otpVerifying = async (req, res) => {
    try {
      const{otp,userId} = req.body
      console.log("hello otp and userId ",otp, userId)
      const otpData = await otpModel.findOne({userId:userId})
      console.log(otpData,"this is otpDataaa")
      const { expiresAt } = otpData;
      const correctOtp = otpData.otp;
      if(otpData && expiresAt < Date.now()){
        return res.status(401).json({ message: "Email OTP has expired" });
      }
      if(correctOtp == otp) {
        await otpModel.deleteMany({userId: userId});
        await User.updateOne({_id:userId},{$set:{is_verified:true}})
        res.status(200).json({
          status:true,
          message:"User registration success, you can login now",
        })
      }else{
        res.status(400).json({status:false, message:"Incorrect OTP"})
      }

  
    } catch (error) {
      console.log(error.message)
      res.status(500).json({ message: "Internal Server Error" });
    }
  };


  const securePassword = async (password) => {
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      console.log(passwordHash,"ps hashhh");
      return passwordHash;
    } catch (error) {
      console.log(error.message);
    }
  };

  const insertUser = async (req, res) => {
    try {
      console.log(req.body, "body");
      const email = req.body.email;
      const already = await User.findOne({ email: email });
  
      if (already) {
        return res.status(400).json({ message: "This email is already taken" });
      } else {
        const name = req.body.name;
        const pass = req.body.password;
        const spassword = await securePassword(pass);
        const user = new User({
          name: name,
          email: req.body.email,
          number: req.body.phone,
          password: spassword,
        });
  
        const userData = await user.save();
        const newUserID = userData._id;
  
        otpId = await sendVerifymail(userData.name, userData.email, userData._id)

        res.status(201).json({
          status:`otp has send to ${email}`,
          userData: userData,
          otpId:otpId
        })
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
  

  const verifyLogin = async (req, res) => {
    try {
      const email = req.body.email;
      // console.log(email, "got the email")
      const password = req.body.password;
      const user = await User.findOne({ email: email });
      // console.log(user, "this is user details")
      if(!user) {
        return res.status(401).json({message:"User not registered"})
      }
      if(user.is_verified){
        if(user.is_blocked == false){
          const correctPassword = await bcrypt.compare(password, user.password)
          if(correctPassword) {
            const token = jwt.sign(
              {name: user.name, email:user.email, id:user._id,role: "user"},
              process.env.SECRET_KEY,
              {
                expiresIn: "1h",
              }
            );
            req.session.user_id = user._id;
            res.status(200).json({ user, token, message: `Welome ${user.name}` });
          }else{
            return res.status(403).json({ message: "Incorrect password" });
          }
        }else{
          return res.status(403).json({ message: "User is blocked" });
        }
      }else{
        return res.status(401).json({ message: "Email is not verified" });
      }
      
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };

  const resendOtp = async(req,res)=>{
    try {
      const {userEmail} = req.body
      console.log(userEmail,"resend otp maill");
      const { _id, name, email } = await User.findOne({ email: userEmail });
      await otpModel.deleteMany({userId:_id})
      const otpId = sendVerifymail(name,email,_id)
      if(otpId){
        res.status(200).json({
          message:`An otp has been resend to ${email}`
        })
      }
    } catch (error) {
      console.log(error.message)
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
  const roomList = async (req, res) => {
    try {
      const rooms = await Room.find({is_blocked:false})
      res.status(200).json({ rooms });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ status: "Internal Server Error" });
    }
  };

  const roomDetails = async (req, res) => {
    try {
      const {roomId} = req.params
      const roomDetails = await Room.find({_id:roomId})
      res.status(200).json({ roomDetails });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ status: "Internal Server Error" });
    }
  };

  const forgotPassword = async(req,res)=>{
    try {
      const email = req.body.email
      const user  = await User.findOne({email:email})
      if(!user){
        return res.status(401).json({message:"User not found"})
      }else{
        otpId = await sendVerifymail(user.name, user.email, user._id)
        res.status(201).json({
          status:`otp has send to ${email}`,
          userData: user,
          otpId:otpId
        })
      }
    } catch (error) {
      console.log(error)
      return res.status(500).json({ error: "Internal Server Error" })
    }
  }

  const setNewPassword = async(req,res)=>{
    try {
  
      const password = req.body.password
      const userId = req.body.userId
      const spassword = await securePassword(password)
      await User.findOneAndUpdate({_id:userId},{$set:{password:spassword}})
      res.status(200).json({ message: "Password updated" });
    } catch (error) {
      console.log(error.message)
      res.status(500).json({ status: "Internal Server Error" });
    }
  }

  const editProfile = async(req,res)=>{
    try {

      const {email, name, number,userId} = req.body
      console.log(userId,"okok")
      await User.findByIdAndUpdate({_id:userId},{$set:{
        name:name,
        email:email,
        number:number
      }})
      const user = await User.findOne({_id:userId})
      res.status(200).json({user
        ,message: "Updated"})
    } catch (error) {
      console.log(error.message)
      res.status(500).json({ status: "Internal Server Error" });
    }
  }

  const bookRoom = async (req,res)=>{
    try {
      const date = new Date()
      const now = new Date();
      const exp = new Date(now.getTime() + 30 * 60000);
      const {roomId,userId,ownerId} = req.body
      const room = await Room.findOne({_id:roomId})
      const booking = new Booking({
        date,
        ownerId,
        roomId,
        userId,
        cancelExp: exp,
        room:
          {
            acType:room.acType,
            location: room.location,
            roomName: room.roomName,
            image: room.roomImages[0]
          }
        
      })
      await booking.save()
      await Room.findByIdAndUpdate({_id:roomId},{$set:{is_available:false}})
      res.status(200).json({ message: "Room Booked" });
    } catch (error) {
      console.log(error.message)
      res.status(500).json({ status: "Internal Server Error" });
    }
  }

  const myBookings = async(req,res)=>{
    try {
      const {userId} = req.params
      const booked = await Booking.find({userId:userId})
      res.status(200).json({ booked });
    } catch (error) {
      console.log(error.message)
      res.status(500).json({ status: "Internal Server Error" });
    }
  }

  const cancelBooking = async(req,res)=>{
    try {
      const {bookId} = req.body
      const rm = await Booking.findByIdAndUpdate({_id:bookId},{$set:{isCancelled:true}})
      const roomId = rm.roomId
      await Room.findByIdAndUpdate({_id:roomId},{$set:{is_available:true}})
      res.status(200).json({ message: "Booking Cancelled" });
    } catch (error) {
      console.log(error.message)
    }
  }

  module.exports = {
    sendVerifymail,
    insertUser,
    verifyLogin,
    otpVerifying,
    resendOtp,
    roomList,
    roomDetails,
    forgotPassword,
    setNewPassword,
    editProfile,
    bookRoom,
    myBookings,
    cancelBooking
  }

  
