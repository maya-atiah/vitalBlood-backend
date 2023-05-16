const express = require('express');
const router = express.Router();
const upload = require("../Middleware/uploadMiddleware.js");
const multer = require('multer');

const { initializeApp } = require('firebase/app');
const firebaseConfig = require('../Config/firebase.js')
initializeApp(firebaseConfig);


// Setting up multer as a middleware
const uploadNew = multer({ storage: multer.memoryStorage() });
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
router.put('/updateUserProfile/:userId', uploadNew.single("image"),updateUserProfile)

module.exports = router;