const express = require('express');
const router = express.Router();



const {getUsers,
    getUserById,
    updatePassword,
    updateUser,
    deleteUser,
    getUerProfile
    } = require('../controller/userContoller');
const {isAuthenticationUser,authorizeRoles} = require('../middlewares/auth');

router.route('/users').get(isAuthenticationUser,getUsers);
//GET /api/users/:id  Get user by id
router.route("/password/update").put(isAuthenticationUser,authorizeRoles,updatePassword);
router.route("/users/update").put(isAuthenticationUser,authorizeRoles,updateUser);
router.route("/users/delete").delete(isAuthenticationUser,authorizeRoles,deleteUser);
router.route("/users/profile").get(isAuthenticationUser,authorizeRoles,getUerProfile);

module.exports= router;