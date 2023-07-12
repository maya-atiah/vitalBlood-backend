const Notification = require('../Models/NotificationModel')
const NotificationUser = require('../Models/NotificationUserModel')



exports.deleteAllNotification = async (req, res) => {
    
    try {
        
    } catch(error) {
        return res.status(500).json({ message: error.message });
    }
    await Notification.deleteMany()
    await NotificationUser.deleteMany()

    res.json({ message: 'all notifications are deleted' })
    
}


exports.getNotificationByUserId = async (req, res) => {
    try {
        const userID = req.user

        const notifications = await NotificationUser.find({ user_id: userID }).populate('notification_id')


        if (notifications.length === 0) {
            return res.json({message:"NO new notifications"})
        }

        res.json({ message: "Notifications", notifications })
        
    } catch(error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
  
}

exports.viewedNotification = async (req, res) => {

    try { 
        const { notificatioId } = req.params;

        const notificationUser = await NotificationUser.findOne({
            notification_id: notificatioId,
            user_id: req.user
        });

        if (!notificationUser) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        notificationUser.is_viewed = true

        await notificationUser.save()

        return res.json({ message: 'Notification marked as viewed' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
   

}