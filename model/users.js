const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"]
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    validate: [validator.isEmail, "Please enter valid email address"]
  },
  roles: {
    type: String,
    default: "user",
    enum: {
      values: ["user", "employee"],
      message: "Please select correct role"
    }
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minlength: [6, "Please enter password at least 6 character"],
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
});

//Encypting password before saving
userSchema.pre('save',async function(next){
    if(!this.isModified('password')){
      next();
    }

    this.password =await bcrypt.hash(this.password, 10)
});

// Return JSON Web Token
userSchema.methods.getJwtToken = function(){
    return jwt.sign({id: this._id}, process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRES_TIME
    });


}

//compare user password in database password
userSchema.methods.comparePassword = async function(enterPassword){
  return await bcrypt.compare(enterPassword,this.password);
}

//Generate password ResetToken
userSchema.methods.getResetPasswordToken= async function(){
  //Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  //Hash and set to resetPasswordToken
  this.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

  //Set token expire time
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

  return resetToken;

}

module.exports = mongoose.model("User", userSchema);
