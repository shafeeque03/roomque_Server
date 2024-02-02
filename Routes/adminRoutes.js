const express = require('express')
const adminRoute = express();
const adminController = require("../Controller/adminController")

adminRoute.post('/login',adminController.adminLogin)
adminRoute.get('/users',adminController.usersList)
adminRoute.patch('/blockUser',adminController.userBlock)
adminRoute.get('/owners',adminController.ownerList)
adminRoute.patch('/blockOwners',adminController.ownerBlock)
adminRoute.patch('/blockRoom',adminController.roomBlock)
adminRoute.get('/rooms',adminController.roomList)
adminRoute.get('/bookings',adminController.bookingList)
adminRoute.get('/dashData',adminController.dashboardData)
adminRoute.post('/addCategory',adminController.addCategory)


module.exports = adminRoute