const express = require("express")
const dotenv = require("dotenv")
const mongoose = require("mongoose")
// bcrypt
const bcrypt = require("bcrypt")
// jsonwebtoekn
const jwt = require("jsonwebtoken")
const authRouter=require("./routes/authRoutes")
const userRouter=require("./routes/userRoutes")
app.use(express.json())
app.use("/api/auth",authRouter)
app.use('/api/users',userRouter)
app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`)
})