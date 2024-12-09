const jwt = require("jsonwebtoken");
const User = require("../Model/userModel");
const Owner = require("../Model/ownerModel");
const Room = require("../Model/roomModel");
const Booking = require("../Model/bookingModel");
const Category = require("../Model/categoryModel");
const dotenv = require("dotenv");
dotenv.config();

const adminLogin = async (req, res) => {
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
    const users = await User.find();
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
    const owners = await Owner.find();
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
    const rooms = await Room.find();
    res.status(200).json({ rooms });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ status: "Internal Server Error" });
  }
};

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

const bookingList = async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.status(200).json({ bookings });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ status: "Internal Server Error" });
  }
};

const addCategory = async (req, res) => {
  try {
    console.log("calling heree");
    const { category } = req.body;
    const exist = await Category.findOne({ name: category });
    if (exist) {
      res.status(403).json({ message: "Category Already Exist" });
    } else {
      const Cat = new Category({
        name: category,
      });
      Cat.save();
      res.status(200).json({ message: "Category Added" });
    }
  } catch (error) {
    console.log(error.message);
  }
};


const dashboardData = async (req, res) => {
  try {
    const today = new Date();
    const fiveDaysAgo = new Date(today);
    fiveDaysAgo.setDate(today.getDate() - 4);

    const saless = await Booking.aggregate([
      {
        $match: {
          date: { $gte: fiveDaysAgo, $lte: today },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            day: { $dayOfMonth: "$date" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
      },
    ]);
    const dailyBookingCounts = saless.map((entry) => entry.count);
    const userCount = await User.find().countDocuments();
    const ownerCount = await Owner.find().countDocuments();
    const roomCount = await Room.find().countDocuments();

    const bookings = await Booking.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            day: { $dayOfMonth: "$date" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: "$count" },
          totalDays: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          averageBookingsPerDay: { $divide: ["$totalBookings", "$totalDays"] },
        },
      },
    ]);

    const averageBookingsPerDay = bookings[0].averageBookingsPerDay.toFixed(1);
    
    
    res
      .status(200)
      .json({ averageBookingsPerDay, userCount, ownerCount, roomCount,dailyBookingCounts });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  adminLogin,
  usersList,
  userBlock,
  ownerList,
  ownerBlock,
  roomList,
  roomBlock,
  bookingList,
  dashboardData,
  addCategory,
};
