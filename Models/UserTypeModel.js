const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userTypesSchema = new Schema({

    type: {
        type: String,
        enum: ["individual", "organization"],

    }
})

const UserTypes = mongoose.model('UserTypes', userTypesSchema);
module.exports = UserTypes;