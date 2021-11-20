const mongoose = require("mongoose");
const dotenv = require("dotenv");
exports.connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("connected");
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};
