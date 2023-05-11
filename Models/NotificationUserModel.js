const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationUserSchema = new Schema({

    notification_id: {
        type: Schema.Types.ObjectId,
        ref: 'Notification'
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    is_viewed: {
        type: Boolean,
        default: false
    }
})



const NotificationUser = mongoose.model('NotificationUser', notificationUserSchema);
module.exports = NotificationUser;