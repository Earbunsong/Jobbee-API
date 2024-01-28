const express = require('express');
const router = express.Router();



const {getUsers,
    getUserById,
    updatePassword,
    updateUser,
    deleteUser,
    getUerProfile,
    getAppliedJobs
    } = require('../controller/userContoller');
const {isAuthenticationUser,authorizeRoles} = require('../middlewares/auth');

router.route('/users').get(isAuthenticationUser,getUsers);
//GET /api/users/:id  Get user by id
router.route("/password/update").put(isAuthenticationUser,updatePassword);
router.route("/users/update").put(isAuthenticationUser,updateUser);
router.route("/users/delete").delete(isAuthenticationUser,deleteUser);
router.route("/users/profile").get(isAuthenticationUser,getUerProfile);
// router.route("/jobs/applied").get(getAppliedJobs);
module.exports= router;