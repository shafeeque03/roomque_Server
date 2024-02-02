const express = require('express')
const messageRoute = express();
const messageController = require("../Controller/messageController")

messageRoute.post('/', messageController.addMessage)
messageRoute.get('/:chatId', messageController.getMessage)

module.exports = messageRoute