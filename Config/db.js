const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        mongoose.set('strictQuery', true);
        await mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: "true"
        });
        console.log('MongoDB is Connected...');
    } catch (err) {
        console.log(err.message);
    }
};

module.exports = connectDB;