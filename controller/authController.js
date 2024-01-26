const User = require("../model/users");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const errorhandle = require('../utils/errorhandle');
const sendToken =require('../utils/jwtToken');
const { reset } = require("nodemon");
const sendEmail = require('../utils/sendEmail');


// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// Update a Job  =>  /api/v1/job/:id


const registerUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password, roles } = req.body;

    const user = await User.create({
      name,
      email,
      password,
      roles
    });

    sendToken(user, 200, res)

    //Create JWT Token

    const token = user.getJwtToken();

     res.status(200).json({
      success: true,
      message: "User register successfully",
      token
    });
});

// Login user => /api/v1/login
const loginUser = catchAsyncErrors ( async (req, res, next) => {
      const {email, password} = req.body;


      //check if email and password is entered by user
      if(!email || !password){
        return next(new errorhandle('Please enter email & password', 400))
      }

      //finding user in database
      const user = await User.findOne({email}).select('+password');

      if(!user){
        return next(new errorhandle('Invalid email orr password.', 401))
      }
      //Checking the password

      const isPasswordMatched = await user.comparePassword(password);

      if(!isPasswordMatched){
        return next(new errorhandle('Invalid email or password.', 401))
      }

      //Create JWT  Token
      sendToken(user, 200, res)

 });


 // Forgot Password => /api/v1/password/forgot
 const forgotPassword = catchAsyncErrors(async (res, req, next)=>{
    const user = await User.findOne({email : req.body.email});

    //Check user email in database 
    if(!user){
      return next(new errorhandle('User not found with this email', 404))
    }
    //Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({validateBeforeSave : false});


    //Create reset password url 
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/
    reset/${resetToken}`;

    const message = `Your password reset link is as follow:\n\n$P{resetUrl}
    \n\nIf you have not requested this email, then ignore it.`

    try {
      await sendEmail({
        email : user.email,
        subject : ' Jobbee-Password Recovery',
        message
      })
  
      res.status(200).json({
        success : true,
        message : `Email sent successfully to : ${user.email}`
      });
    }catch(error){
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave : false});

      return next(new errorhandle(error.message, 500))

    }


 });

//compare this snippet from controller/jobs.js
module.exports = {
  registerUser,
  loginUser
};
