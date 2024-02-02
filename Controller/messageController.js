const Message = require("../Model/messageModel")

const addMessage = async(req,res)=>{
    try {
        // console.log("call from addMesssageeee")
        const {chatId,text,senderId} = req.body
        const message = new Message({chatId,text,senderId})
        const result = await message.save()
        // console.log(result,"resultttttttttt")
        res.status(200).json(result)
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

const getMessage = async(req,res)=>{
    try {
        // console.log(" Call get getMessageee")
        const {chatId} = req.params
        const result = await Message.find({chatId})
        res.status(200).json(result)
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({message: "Internal Server Error"})
    }
}

module.exports = {
    addMessage,
    getMessage
}