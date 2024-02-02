const express = require('express')
const chatRoute = express();
const chatController = require("../Controller/chatController")

chatRoute.get('/ownerData/:id',chatController.ownerData)
chatRoute.get('/userData/:id',chatController.userData)
chatRoute.get('/:userId',chatController.userChats)



module.exports = chatRoute