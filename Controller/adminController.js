const jwt = require("jsonwebtoken")
const User = require('../Model/userModel')
const Owner = require('../Model/ownerModel')
const Room = require('../Model/roomModel')
const dotenv = require("dotenv")
dotenv.config()

const adminLogin =  async (req, res) => {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const userName = "Admin";
    try {
      const { email, password } = req.body;
      // console.log(email, password, "email and passowrd vrooo")
      if (adminEmail === email) {
          if (adminPassword === password) {
            // console.log("something fishy password")
          const token = jwt.sign(
            {
              name: userName,
              email: adminEmail,
              role: "admin",
            },
            process.env.ADMIN_SECRET,
            {
              expiresIn: "1h",
            }
          );
          res
            .status(200)
            .json({ userName, token, message: `Welome ${userName}` });
        } else {
          res.status(403).json({ message: "Incorrect Password" });
        }
      } else {
        res.status(401).json({ message: "Incorrect email" });
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ status: "Internal Server Error" });
    }
  };

  const usersList = async (req, res) => {
    try {
      const users = await User.find()
      res.status(200).json({ users });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ status: "Internal Server Error" });
    }
  };

  const userBlock = async (req, res) => {
    try {
      const { userId, status } = req.body;
      await User.findByIdAndUpdate(userId, { $set: { is_blocked: !status } });
      res.status(200).json({ message: "updated" });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ status: "Internal Server Error" });
    }
  };

  const ownerList = async (req, res) => {
    try {
      const owners = await Owner.find()
      res.status(200).json({ owners });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ status: "Internal Server Error" });
    }
  };

  const ownerBlock = async (req, res) => {
    try {
      const { ownerId, status } = req.body;
      await Owner.findByIdAndUpdate(ownerId, { $set: { is_blocked: !status } });
      res.status(200).json({ message: "updated" });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ status: "Internal Server Error" });
    }
  };

  const roomList = async (req, res) => {
    try {
      const rooms = await Room.find()
      res.status(200).json({ rooms });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ status: "Internal Server Error" });
    }
  };

  const roomBlock = async (req,res)=>{
    try {
      const { roomId, status } = req.body;
      await Room.findByIdAndUpdate(roomId, {$set:{is_blocked: !status}})
      res.status(200).json({message:"updated"})
    } catch (error) {
      console.log(error.message)
      res.status(500).json({ status: "Internal Server Error" });
    }
  }

  module.exports = {
    adminLogin,
    usersList,
    userBlock,
    ownerList,
    ownerBlock,
    roomList,
    roomBlock
  }