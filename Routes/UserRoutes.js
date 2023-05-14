const express = require('express');
const router = express.Router();
const upload = require("../Middleware/uploadMiddleware.js");
const {
    register,
    login,
    getAllUsers,
    deleteUserById,
    getUserbyid,
    updateUserProfile
} = require('../Controllers/UserController');


router.post('/register', upload.single('image'), register);
router.post('/login', login);
router.get('/getAllUsers', getAllUsers);
router.get('/getUserbyid/:userId', getUserbyid);
router.delete('/deleteUser/:userId', deleteUserById);
router.put('/updateUserProfile/:userId', upload.single('image') ,updateUserProfile)

module.exports = router;