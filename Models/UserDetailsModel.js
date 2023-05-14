const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { isEmail } = require('validator');

const userDetailsSchema = new Schema({

    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: [isEmail, 'Please enter a valid email.']
    },
    password: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false,
    },
    marital_status: {
        type: String,
    },
    gender: {
        type: String
    },
    id_number: {
        type: Number,

    },
    blood_type: {
        type: String
    },
    nationality: {
        type: String,
    },
    emergency_number: {
        type: Number,
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    is_deleted: {
        type: Boolean
        
    }
})


const UserDetails = mongoose.model('UserDetails', userDetailsSchema);
module.exports = UserDetails;