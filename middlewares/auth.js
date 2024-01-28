const jwt = require("jsonwebtoken");
const User = require("../model/users");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const errorhandle = require("../utils/errorhandle");

//check if the user is authentication or not
const isAuthenticationUser = catchAsyncErrors(async (req, res, next) => {
  let token;
  console.log(req.headers.authorization);
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new errorhandle("Login first to access this resource", 401));
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id);

  next();
});

//handle users roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new errorhandle(
          `Role (${req.user.role}) is not allowed to access this resource`,
          403
        )
      );
    }
    next();
  };
};

module.exports = {
  isAuthenticationUser,
  authorizeRoles
};
