const express = require('express')
const cors = require('cors')
const app = express()
const dotenv = require('dotenv')
const bodyParser = require('body-parser')
dotenv.config()
const session = require('express-session')
const config = require('./Config/config')

const connectDB = require('./Config/Database')
connectDB.dbconnect()
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors({
    origin:"http://localhost:5174",
    methods:['GET','POST','PUT','PATCH'],
    credentials:true
}));

app.use(session ({secret:config.sessionSecret}))

const userRoutes = require('./Routes/userRoutes')
app.use('/', userRoutes)

const adminRoutes = require('./Routes/adminRoutes')
app.use('/admin', adminRoutes)

const ownerRoutes = require('./Routes/ownerRoutes')
app.use('/owner', ownerRoutes)

app.listen(3001,()=>console.log('app is running on 3001'));