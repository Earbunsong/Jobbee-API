const express = require("express");
const router = express.Router();

const { registerUser, 
       loginUser,
       forgotPassword,
       resetPassword,
       logout,
       } = require("../controller/authController");
// const {getJobs, getJob, newJob, updateJob, deleteJob} = require('../controller/jobsController');
const {isAuthenticationUser, authorizeRoles} = require('../middlewares/auth');

router.route("/register").post(registerUser);
router.route("/login").post(isAuthenticationUser,authorizeRoles,loginUser);
router.route('/password/forgot').post(isAuthenticationUser,authorizeRoles,forgotPassword);
router.route('/password/reset/:token').put(isAuthenticationUser,authorizeRoles,resetPassword);
router.route('/logout').get(isAuthenticationUser,authorizeRoles,authorizeRoles,logout);


module.exports = router;