const Owner = require("../Model/ownerModel")
const bcrypt = require("bcrypt")
const nodemailer = require("nodemailer")
const {json} = require("express")
const dotenv = require("dotenv")
const otpOwnerModel = require("../Model/otpOwner")
const jwt = require('jsonwebtoken')
const cloudinary = require("../utils/cloudinary")
const { promises } = require("dns")
const Room = require("../Model/roomModel")
const { ObjectId } = require("mongodb")
const Booking = require("../Model/bookingModel")
const Category = require("../Model/categoryModel")
dotenv.config()

var otpId;

const sendVerifymail = async (name, email,ownerId) => {
  try {
    // console.log(name, email, ownerId, "datas on verifymail");
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
    const verificationOtp = new otpOwnerModel({
      ownerId:ownerId,
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
    const{otp,ownerId} = req.body
    // console.log("hello otp and ownerId ",otp, ownerId)
    const otpData = await otpOwnerModel.findOne({ownerId:ownerId})
    const { expiresAt } = otpData;
    const correctOtp = otpData.otp;
    if(otpData && expiresAt < Date.now()){
      return res.status(401).json({ message: "Email OTP has expired" });
    }
    if(correctOtp == otp) {
      await otpOwnerModel.deleteMany({ownerId:ownerId});
      await Owner.updateOne({_id:ownerId},{$set:{is_verified:true}})
      res.status(200).json({
        status:true,
        message:"Verified",
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
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};


const insertOwner = async (req, res) => {
  try {
    // console.log("call from insert owner");
    // console.log(req.body, "body");
    const email = req.body.email;
    const already = await Owner.findOne({ email: email });

    if (already) {
      return res.status(400).json({ message: "This email is already taken" });
    } else {
      const name = req.body.name;
      const pass = req.body.password;
      const spassword = await securePassword(pass);
      const owner = new Owner({
        name: name,
        email: req.body.email,
        number: req.body.phone,
        password: spassword,
      });

      const ownerData = await owner.save();
      const newOwnerId = ownerData._id;

      otpId = await sendVerifymail(ownerData.name, ownerData.email, ownerData._id)

      res.status(201).json({
        status:`otp has send to ${email}`,
        ownerData: ownerData,
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
    const owner = await Owner.findOne({ email: email });
    // console.log(owner, "this is owner details")
    if(!owner) {
      return res.status(401).json({message:"User not registered"})
    }
    if(owner.is_verified){
      if(owner.is_blocked == false){
        const correctPassword = await bcrypt.compare(password, owner.password)
        if(correctPassword) {
          const token = jwt.sign(
            {name: owner.name, email:owner.email, id:owner._id,role: "owner"},
            process.env.SECRET_KEY,
            {
              expiresIn: "1h",
            }
          );
          res.status(200).json({ owner, token, message: `Welome ${owner.name}` });
        }else{
          return res.status(403).json({ message: "Incorrect password" });
        }
      }else{
        return res.status(403).json({ message: "User is blocked by admin" });
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
    const {ownerEmail} = req.body
    // console.log(ownerEmail,"resend otp maill");
    const { _id, name, email } = await Owner.findOne({ email: ownerEmail });
    await otpOwnerModel.deleteMany({ownerId:_id})
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

const getMyRoom = async(req,res)=>{
  try {

    const {ownerId} = req.params
    const rooms = await Room.find({
      ownerId: ownerId,
      is_blocked: false,
    });
    
    // console.log(rooms,"this is owner rooms")
    res.status(201).json({ rooms,message: "Room Passed successfully" });
    
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: "Internal Server Error" });

  }
}

const addRoom = async (req, res) => {
  try {
    const {
      roomName,
      rent,
      ownerId,
      phone,
      about,
      location,
      roomImage,
      roomType,
      acType,
      model
    } = req.body;
    console.log(location, "this is location")


    if (!Array.isArray(roomImage)) {
      throw new Error("roomImage must be an array");
    }

    const uploadPromises = roomImage.map((image) => {
      return cloudinary.uploader.upload(image, {
        folder: "RoomImages"
      });
    });

    const uploadImages = await Promise.all(uploadPromises);
    let roomImages = uploadImages.map((image) => image.secure_url);

    await Room.create({
      roomName,
      ownerId,
      about,
      location,
      phone,
      rent,
      roomType,
      roomImages,
      acType,
      model
    });

    res.status(201).json({ message: "Room added successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ status: "Internal Server Error" });
  }
};

const editRoom = async(req,res)=>{
  try {
    // console.log("data got backend also")
    const {
      roomName,
      rent,
      roomId,
      phone,
      about,
      location,
      acType,
      roomType,
      roomImage
    } = req.body;
    let existingImage = [];
    const roomExist = await Room.findById({_id:roomId})

    if (roomImage.length === 0) {
      existingImage = roomExist.roomImages;
    } else {
      const uploadPromises = roomImage.map((image) => {
        return cloudinary.uploader.upload(image, {
          folder: "RoomImages",
        });
      });
      // Wait for all the uploads to complete using Promise.all
      const uploadedImages = await Promise.all(uploadPromises);

      if (
        roomExist &&
        roomExist.roomImages &&
        roomExist.roomImages.length > 0
      ) {
        existingImage = roomExist.roomImages;
      }

      // Store the URLs in the roomImages array
      let roomImages = uploadedImages.map((image) => image.secure_url);
      for (let i = 0; i < roomImages.length; i++) {
        existingImage.push(roomImages[i]);
      }
    }

    await Room.findByIdAndUpdate(
      {_id:roomId},
      {$set:{
        roomName,
        rent,
        phone,
        about,
        location,
        acType,
        roomType,
        roomImages:existingImage
      }}
    )
    res.status(200).json({ message: "Room updated" });
    
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ status: "Internal Server Error" });
  }
}

const deleteRoom = async(req,res)=>{
  try {

    const roomId = req.body.roomId
    console.log("roomid got",roomId)
    
  } catch (error) {
    console.log(error.message)
  }
}

const deleteRoomImage = async (req, res) => {
  try {
    const { imageUrl, roomId } = req.body;
    // console.log("delete image Working",roomId)
    const publicId = imageUrl.match(/\/v\d+\/(.+?)\./)[1]; // Extract public ID from URL

    const deletionResult = await cloudinary.uploader.destroy(publicId, {
      folder: "RoomImages", // Optional, specify the folder if necessary
    });

    if (deletionResult.result === "ok") {
      const updatedData = await Room.findByIdAndUpdate(
        { _id: roomId },
        { $pull: { roomImages: imageUrl } },
      );
      if (!updatedData) {
        return res.status(404).json({ message: "Room not found" });
      }

      return res
        .status(200)
        .json({ message: "Image removed successfully", updatedData });
    } else {
      console.error(
        `Failed to delete image at ${imageUrl} in RoomImages from Cloudinary.`
      );
      return res.status(500).json({ message: "image not found in cloudinary" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ status: "Internal Server Error" });
  }
};

const getMyRoomDetail = async(req,res)=>{
  try {
    const {roomId} = req.params
    const room = await Room.findById({_id:roomId})
    // console.log(rooms,"this is owner rooms")
    res.status(201).json({ room,message: "Room Passed successfully" });
    
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: "Internal Server Error" });

  }
}

const roomBlock = async (req, res) => {
  try {
    const { roomId, status } = req.body;
    await Room.findByIdAndUpdate(roomId, { $set: { is_blocked: !status } });
    res.status(200).json({ message: "updated" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ status: "Internal Server Error" });
  }
};

const forgotPassword = async(req,res)=>{
  try {
    const email = req.body.email
    // console.log("heuuu")
    const owner  = await Owner.findOne({email:email})
    if(!owner){
      return res.status(401).json({message:"Owner not found"})
    }else{
      otpId = await sendVerifymail(owner.name, owner.email, owner._id)
      res.status(201).json({
        status:`otp has send to ${email}`,
        ownerData: owner,
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
    const ownerId = req.body.ownerId
    const spassword = await securePassword(password)
    await Owner.findOneAndUpdate({_id:ownerId},{$set:{password:spassword}})
    res.status(200).json({ message: "Password updated" });
  } catch (error) {
    console.log(error.message)
  }
}

const myBookingss = async(req,res)=>{
  try {
    const {ownerId} = req.params
    const booked = await Booking.find({ownerId:ownerId})
    res.status(200).json({ booked });
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ status: "Internal Server Error" });
  }
}

const editProfileOwner = async(req,res)=>{
  try {

    const {email, name, number,ownerId} = req.body
    console.log(ownerId,"okok")
    await Owner.findByIdAndUpdate({_id:ownerId},{$set:{
      name:name,
      email:email,
      number:number
    }})
    const owner = await Owner.findOne({_id:ownerId})
    res.status(200).json({owner
      ,message: "Updated"})
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ status: "Internal Server Error" });
  }
}

const checkedIn = async(req,res)=>{
  try {
    const {bookId} = req.body
    await Booking.findByIdAndUpdate({_id:bookId},{$set:{checkedIn:true, status:"Checked"}})
    res.status(200).json({message:"checkedIn Updated"})
  } catch (error) {
    console.log(error.message)
  }
}


const allCategories = async(req,res)=>{
  try {
    const categories = await Category.find()
    res.status(200).json({categories})
  } catch (error) {
    console.log(error.message)
  }
}

const dashboardDataa = async(req,res)=>{
  try {
    const {ownerId} = req.params
    const myRoomCount = await Room.find({ownerId:ownerId}).countDocuments()
    const mybookingsCount = await Booking.find({ownerId:ownerId}).countDocuments()
    const luxuryRooms = await Room.find({ ownerId: ownerId, model: "Luxury" }).countDocuments();
    const normalRooms = await Room.find({ownerId:ownerId,model:"Normal"}).countDocuments()
    const fourbooks = await Booking.find({ownerId:ownerId}).limit(4)
    // console.log(fourbooks,"kitti");
    res.status(200).json({myRoomCount, mybookingsCount, luxuryRooms, normalRooms, fourbooks})
    // console.log(ownerId,myRoomCount,mybookingsCount,luxuryRooms,normalRooms, "this is owneriss")
    
  } catch (error) {
    console.log(error.message)
  }
}



  module.exports = {
    sendVerifymail,
    insertOwner,
    otpVerifying,
    verifyLogin,
    resendOtp,
    addRoom,
    getMyRoom,
    editRoom,
    deleteRoom,
    deleteRoomImage,
    getMyRoomDetail,
    roomBlock,
    forgotPassword,
    setNewPassword,
    myBookingss,
    editProfileOwner,
    checkedIn,
    allCategories,
    dashboardDataa

  }