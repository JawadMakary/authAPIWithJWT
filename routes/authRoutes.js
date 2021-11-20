const express=require("express")
const dotenv=require("dotenv")
const router=express.Router()
const authController=require("../controllers/authController")

router.post("/signup",authController.signup)
router.post("/login",authController.login)
module.exports=router
