const jwt = require("jsonwebtoken");
const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const validator = require("validator");
const { promisify } = require("util");
const sendMail = require("../utils/email").sendMail;
const crypto = require("crypto");
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createSendToken = (user, statusCode, res) => {
  // mongoose create this _id
  const token = signToken(user._id);
  // console.log(token)
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};
exports.signup = async (req, res) => {
  try {
    const emailCheck = await User.findOne({ email: req.body.email });
    if (emailCheck) {
      return res.status(409).json({
        message: "email already exists",
      });
    }
    if (!validator.isEmail(req.body.email)) {
      return res.status(400).json({
        message: "invalid email",
      });
    }
    if (req.body.password !== req.body.passwordConfirm) {
      return res.status(400).json({
        message: "password does not match",
      });
    }
    const newUser = await User.create({
      email: req.body.email,
      password: req.body.password,
      name: req.body.name,
      passwordConfirm: req.body.passwordConfirm,
      passwordChangedAt: req.body.passwordChangedAt,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.checkPassword(password, user.password))) {
      return res.status(400).json({
        message: "email does not exist",
      });
    }
    createSendToken(user, 200, res);
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};
exports.protect = async (req, res, next) => {
  try {
    let token;
    // if there is a token it will be in the header
    // bearer is found by default
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // split the token from the bearer
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return res.status(401).json({
        message: "you are not logged in",
      });
    }
    // verify the token
    let decoded;
    try {
      decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    } catch (err) {
      // if the token is expired
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          message: "token expired",
        });
        // if the token is invalid
      } else if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
          message: "invalid token",
        });
      }
    }
    // check if the user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        message: "you are not logged in",
      });
    }
    // if user changed the password after getting the JWT
    if (currentUser.passwordChangedAfterTokenIssued(decoded.id)) {
      return res.status(401).json({
        message: "your psw has been recently changed. please login again",
      });
    }
    // any new req has a variable currentUser(like creating a session)
    req.user = currentUser;
    next();
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

// forgot password:

exports.forgotPassword = async (req, res) => {
  try {
    // find if user with provided mail exists
    const user = await user.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "the user with the provided mail don't exist" });
    }
    // create random token
    const resetToken = user.generatePasswordResetToken();
    await user.save({
      validateBeforeSave: false,
    });
    // send token via mail
    // url : http://abc/api/auth/resetPassword/token
    // req.protocol:  http or https
    const url = `${req.protocol}://${req.get(
      "host"
    )}/api/auth/resetPassword/${resetToken}`;
    const msg = `Forgot your password? Reset it by visiting the following this link : ${url}`;
    try {
      await sendMail({
        email: user.email,
        subject: "Psw reset token (valid for 10 min only!)",
        message: msg,
      });
      res.status(200).json({
        message: "the reset token was succesfully sent to your mail address",
        status: "Sucess",
      });
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      res.status(500).json({
        message:
          "An error has occured while sending the email, please try again in a few minutes",
      });
    }
  } catch (err) {
    console.log(err);
  }
};
exports.resetPassword = async (req, res) => {
  try {
    const hashtoken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashtoken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        message: "invalid token || expired, please submit another request",
      });
    }
    if (req.body.password.length < 8) {
      return res.status(400).json({
        message: "the psw length must be at least 8 characters",
      });
    }
    if (req.body.password !== req.body.passwordConfirm) {
      return res.status(400).json({
        message: "The psw and the confirmation psw do not match",
      });
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    createSendToken(user, 200, res);
  } catch (err) {
    console.log(err);
  }
};
