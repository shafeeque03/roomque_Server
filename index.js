const express = require('express')
const cors = require('cors')
const app = express()
const dotenv = require('dotenv')
const bodyParser = require('body-parser')
dotenv.config()
const session = require('express-session')
const config = require('./Config/config')
const http = require('http')
const connectDB = require('./Config/Database')
const socketConnection = require('./socketio')

connectDB.dbconnect()
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
    origin:"https://roomque-room.vercel.app",
    methods:['GET','POST','PUT','PATCH'],
    credentials:true
}));

const userRoutes = require('./Routes/userRoutes')
app.use('/', userRoutes)

const adminRoutes = require('./Routes/adminRoutes')
app.use('/admin', adminRoutes)

const ownerRoutes = require('./Routes/ownerRoutes')
app.use('/owner', ownerRoutes)

const chatRoutes = require('./Routes/chatRoutes')
app.use('/chat', chatRoutes)

const messageRoutes = require('./Routes/messageRoutes')
app.use('/message', messageRoutes)

// app.listen(3001,()=>console.log('app is running on 3001'));
const server = http.createServer(app)
socketConnection(server)
server.listen(3001,()=>{console.log('app is running on 3001 works successfully')})