const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    passwordConfirm: {
      type: String,
      required: true,
    },
    passwordChangedAt: Date,
  },

  { timestamps: true }
);
userSchema.pre("save", async function (next) {
    try{
        if(!this.isModified('password')) return next();
        this.password = await bcrypt.hash(this.password, 12);
        this.passwordConfirm = undefined;
        next();
    } 
    catch(err){
        console.log(err);
        next(err);
    }})
userSchema.methods.checkPassword = async function(
    candidatePassword,
    userPassword
  ) {
    try {
      return await bcrypt.compare(candidatePassword, userPassword);
    } catch (err) {
      throw err;
    }
  }
module.exports = mongoose.model("User", userSchema);