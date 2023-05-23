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
        enum: ['accepted', 'rejected', 'pending'],
        default: 'pending'
    },
    type: {
        type: String,
        enum: ['request', 'donate'],
        required: true
    },
    details: {
        purpose: {
            type: String,
            enum: ['bloodRequest', 'bloodDonation'],
            required: true
        },
        patientInfo: {
            firstName: String,
            lastName: String,
            dateOfBirth: Date,
            caseType: String,
            caseDetails: String
        },
        bloodRequest: {
            bloodType: String,
            dateNeeded: Date,
            hospital: String,
            levelOfEmergency: String,
            numberOfUnits: Number
        }
    },
    date: {
        type: Date,
        default: Date.now
    },
    request_id:[ {
        type: Schema.Types.ObjectId,
        ref: 'RequestToDonate'
    }]
});

const Donation = mongoose.model('Donation', donationSchema);
module.exports = Donation;
