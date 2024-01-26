const express = require("express");
const router = express.Router();

const { registerUser, 
       loginUser
       } = require("../controller/authController");
// const {getJobs, getJob, newJob, updateJob, deleteJob} = require('../controller/jobsController');

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

module.exports = router;
