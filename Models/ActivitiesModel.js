const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const activitiesSchema = new Schema({

    name: {
        type:String,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    description: {
        type: String,
    
    },
    image: {
        type:String,
    }

})

const Activity = mongoose.model('Activity', activitiesSchema);
module.exports = Activity;
