    const mongoose = require('mongoose');
    const Schema = mongoose.Schema;
  
    const requestToDonateSchema = new Schema({
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
            enum: ['requested', 'accepted', 'rejected'],
            default: 'requested'
        },
        date: {
            type: Date,
            default: Date.now
        },
        donationRequest_id: {
            type: Schema.Types.ObjectId,
            ref: 'Donation'
        },

    });

    const RequestToDonate = mongoose.model('RequestToDonate', requestToDonateSchema);
    module.exports = RequestToDonate;
