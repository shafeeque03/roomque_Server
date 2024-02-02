const Chat = require("../Model/chatModel");
const User = require("../Model/userModel");
const Owner = require("../Model/ownerModel");

const ownerData = async (req, res) => {
  try {
    const {id} = req.params
    const result = await Owner.findOne({_id:id})
    // console.log(result, "from ownerData")
    res.status(200).json(result)
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const userData = async (req, res) => {
  try {
    const {id} = req.params
    const result = await User.findOne({_id:id})
    // console.log(result, "from userData")
    res.status(200).json(result)
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const userChats = async (req, res) => {
    try {
      const { userId } = req.params;
      // console.log(userId,"from userchats")
        const chats = await Chat.aggregate([
          {
            $match: { members: userId },
          },
          {
            $lookup: {
              from: 'messages',
              let: { chatIdToString: { $toString: '$_id' } },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$chatId", "$$chatIdToString"] },
                  },
                },
                {
                  $sort: { createdAt: -1 },
                },
                {
                  $limit: 1,
                },
              ],
              as: 'messages',
            },
          },
          {
            $addFields: {
              lastMessageTimestamp: {
                $ifNull: [{ $first: '$messages.createdAt' }, null],
              },
            },
          },
          {
            $sort: { lastMessageTimestamp: -1 }, 
          },
        ]);
        // console.log(chats,"iii")
        res.status(200).json(chats);
      } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal Server Error" });
      }
};

module.exports = {
  ownerData,
  userData,
  userChats
};
