const jwt=require("jsonwebtoken")
const express=require("express")
const dotenv=require("dotenv")
const mongoose=require("mongoose")
const bcrypt=require("bcrypt")
const User=require("../models/user")
const validator=require("validator")
const {promisify}=require("util")
const signToken=(id)=>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_IN
    })

}
const createSendToken=(user,statusCode,res)=>{
    // mongoose create this _id
    const token=signToken(user._id)
    // console.log(token)
    res.status(statusCode).json({
        status:"success",
        token,
        data:{
            user
        }
    })


}
exports.signup= async (req,res)=>{
    try{
        const emailCheck=await User.findOne({email:req.body.email})
        if(emailCheck){
            return res.status(409).json({
                message:"email already exists"
            })
        }
        if(!validator.isEmail(req.body.email)){
            return res.status(400).json({
                message:"invalid email"
            })
        }
        if(req.body.password !== req.body.passwordConfirm){
            return res.status(400).json({
                message:"password does not match"
            })
        }
        const newUser=await User.create({
            email:req.body.email,
            password:req.body.password,
            name:req.body.name,
            passwordConfirm:req.body.passwordConfirm,
            passwordChangedAt:req.body.passwordChangedAt,
        })

    }
    catch(err){
        res.status(404).json({
            status:"fail",
            message:err
        })
       
    }   
}
exports.login=async (req,res)=>{
    try{
        const {email,password}=req.body
        const user=await User.findOne({email})
        if(!user || !(await user.checkPassword(password,user.password))){
            return res.status(400).json({
                message:"email does not exist"
            })
        }       
        createSendToken(user,200,res)
    }
    catch(err){
        res.status(404).json({
            status:"fail",
            message:err
        })
    }
}
exports.protect=async (req,res,next)=>{
    try{
        let token;
        // if there is a token it will be in the header
        // bearer is found by default
        if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
            // split the token from the bearer
            token=req.headers.authorization.split(" ")[1]
        }
        if(!token){
            return res.status(401).json({
                message:"you are not logged in"
            })
        }
        // verify the token
        let decoded;
        try{
            decoded=await promisify(jwt.verify)(token,process.env.JWT_SECRET)
        }catch(err){
            // if the token is expired
          if(err.name==="TokenExpiredError"){
            return res.status(401).json({
                message:"token expired"
            })
            // if the token is invalid
          } else if(err.name==="JsonWebTokenError"){
            return res.status(401).json({
                message:"invalid token"
            })
        }}
        // check if the user still exists
        const currentUser=await User.findById(decoded.id)
        if(!currentUser){
            return res.status(401).json({
                message:"you are not logged in"
            })
        }
        req.user=currentUser
        next()

    }catch(err){
        res.status(404).json({
            status:"fail",
            message:err
        })
    }} 