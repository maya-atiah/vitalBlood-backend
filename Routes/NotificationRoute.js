const express = require('express');
const { deleteAllNotification, getNotificationByUserId, viewedNotification } = require('../Controllers/NotificationController');
const { isAuthenticated } = require('../Middleware/userAuthMiddleware');
const router = express.Router();


router.delete('/deleteAll', deleteAllNotification)
router.get('/allNotifications', isAuthenticated, getNotificationByUserId)
router.put('/viewedNotification/:notificatioId',isAuthenticated,viewedNotification)

module.exports=router