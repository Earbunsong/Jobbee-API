const User = require('../model/users');
const errorhandle = require('../utils/errorhandle');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');


// Get all users => /api/v1/users
const getUsers = catchAsyncErrors(async(req,res,next) => {
    const users = await User.find();

    res.status(200).json({
        success: true,
        users
    })
});
const getUerProfile = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findById(req.user.id).populate({
        path : "jobPublished",
        select : "title postingDate"
    });

    res.status(200).json({
        success: true,
        data: user
    })

});

// Get single user => /api/v1/user/:id
const getUserById = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if(!user){
        return next(new ErrorHandler('User not found',404));
    }
    res.status(200).json({
        success: true,
        user
    })
});

// Update current user password => /api/v1/password/update
const updatePassword = catchAsyncErrors(async (req, res, next) => {
   const user = await User.findById(req.user.id).select("+password");
   // Checking old password is correct or not
   
    const isMatched = await user.comparePassword(req.body.currentPassword);
    
    if (!isMatched) {
        return next(new errorhandle('Old password is incorrect', 401))
    }

    user.password = req.body.newPassword;
    await user.save();
    sendToken(user, 200, res, req);               
})

const updateUser = catchAsyncErrors(async(req, res, next)=>{

    const newUserData = {
        name : req.body.name,
        email : req.body.email,
    }

    const user = await User.findByIdAndUpdate(req.user.id,newUserData,{
        new : true,
        runValidators : true
    })

    res.status(200).json({
        success: true,
        data: user
    })

});


// Delete user => /api/v1/admin/user/:id
const deleteUser = catchAsyncErrors(async (req, res, next) => {
     const user = await User.findByIdAndDelete(req.params.id);

     res.cookie("token","none",{
        expries : new Date(Date.now()),
        httpOnly : true
     })
     res.status(200).json({
            success : true,
            message : "User has been deleted"
     })
});    
module.exports = {
    getUsers,
    getUserById,
    updatePassword,
    updateUser,
    deleteUser,
    getUerProfile
}
