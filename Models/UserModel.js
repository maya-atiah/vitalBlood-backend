const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const userSchema = new Schema({

    details_id: {
        type: Schema.Types.ObjectId,
        ref: 'UserDetails'
    },
    type: {
        type: String,
        enum: ["individual", "organization","admin"],
    }
        
    }


)

const User = mongoose.model('User', userSchema);
module.exports = User;