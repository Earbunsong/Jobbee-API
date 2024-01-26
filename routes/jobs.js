const express = require('express');

const router = express.Router();

// import jobs controller methods

const {getJobs,
       newJob,
       getJobInRadius,
       updateJob,
       deleteJob


} = require('../controller/JobController')

const {isAuthenticationUser, authorizeRoles} = require('../middlewares/auth');

router.route('/jobs').get(getJobs);
router.route('/jobs/:zipcode/:distance').get(getJobInRadius);
router.route('/new').post(isAuthenticationUser,authorizeRoles('employee','admin'),newJob);
router.route('/update').put(updateJob).delete(deleteJob);
router.route('/job/:id')
       .put(isAuthenticationUser,authorizeRoles('employee','admin'),updateJob)
       .delete(isAuthenticationUser,authorizeRoles('employee','admin'),deleteJob)

// router.get('/jobs',(req,res)=>{
//      res.status(200).json({
//             success:true,
//             message:"Show all jobs"
//      });
// });

module.exports=router;