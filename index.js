const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
//jwt, bcrypt
require('dotenv').config();

//require(routes)
const userroute = require('./Routes/userRoutes')
const authroute = require('./Routes/authRoutes')
const leadroute = require('./Routes/leadRoutes')

const app = express();
const port = process.env.PORT || 8080;

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

//use(routes)
app.use('/user', userroute)
app.use('/auth', authroute)
app.use('/lead', leadroute)

mongoose.connect(process.env.MONGO_URI)
    .then(() => { console.log(`connected`) })
    .catch(() => { console.log(`Error in connecting`) })

require('./notificationScheduler'); // 👈 Starts cron job

app.listen(port, () => { console.log(`server is running at ${port}`) })