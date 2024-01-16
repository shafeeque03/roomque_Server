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


module.exports = adminRoute