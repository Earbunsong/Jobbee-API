//Create and send token and save  in cookie

const { options } = require("../routes/jobs");

const sendToken = (user, statusCode, res) => {
    //create Jwt token

    const token = user.getJwtToken();

    //options for cookie
    const options = {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE_TIME * 24 * 60 * 60 * 1000),
        httpOnly: true
    };
    // if(process.env.NODE_ENV === 'production'){
    //     options.secure = true;
    // }

    res 
        .status(statusCode)
        .cookie('token',token,options)
        .json({
            success : true,
            token
        })
}

module.exports =sendToken;