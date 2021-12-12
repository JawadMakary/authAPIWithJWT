const express = require("express");
const dotenv = require("dotenv");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token",authController.resetPassword)
module.exports = router;
