const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const donationSchema = new Schema({

    donor_id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
        
    },
    receiver_id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
        
    },
    status: {
        type: String,
        enum: ["accepted", "rejected","pending"],
    },
    type: {
        type: String,
        enum: ["request", "donate"],
        
    },
    details: {
        
        
    },
    date: {
        type: Date,
        default: Date.now,
    }

})

const Donation = mongoose.model('Donation', donationSchema);
module.exports = Donation;