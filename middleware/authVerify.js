const jwt = require('jsonwebtoken')
const secretKey = mysecretkeyforjwt
const User = require("../Model/userModel")
const Owner = require("../Model/ownerModel")

const userTokenVerify = async (req,res,next) =>{
    try {
        let token = req.headers.Authorization;
        if(!token){
            return res.status(403).json({ message: "Access Denied" })
        }

        if (token.startsWith("Bearer ")) {
            token = token.slice(7, token.length).trimLeft();
        }

        const verified = jwt.verify(token, secretKey)
        req.user = verified
        if (verified.role == "user") {
            const user = await User.findOne({email: verified.email});
            if(user.is_blocked){
                return res.status(403).json({message: "User is blocked"})
            }else{
                next()
            }
        }else{
            return res.status(403).json({ message: "Access Denied" });
        }
        
    } catch (error) {
        console.log(error.message)
    }
}

const ownerTokenVerify = async (req,res,next) =>{
    try {
        let token = req.headers.autherization;
        if(!token){
            return res.status(403).json({ message: "Access Denied" })
        }

        if (token.startsWith("Bearer ")) {
            token = token.slice(7, token.length).trimLeft();
        }

        const verified = jwt.verify(token, secretKey)
        req.owner = verified
        if (verified.role == "owner") {
            const owner = await Owner.findOne({email: verified.email});
            if(owner.is_blocked){
                return res.status(403).json({message: "Owner is blocked"})
            }else{
                next()
            }
        }else{
            return res.status(403).json({ message: "Access Denied" });
        }
        
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    userTokenVerify,
    ownerTokenVerify

}