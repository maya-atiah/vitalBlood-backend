const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({

    donation_id: {
        type: Schema.Types.ObjectId,
        ref: 'Donation'
    },
    title: {
        type:String
    },
    message: {
        type:String,
    },
    date: {
        type: Date,
        default: Date.now,
    }
})

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;