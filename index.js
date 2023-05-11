const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
require('dotenv').config();
const connectDB = require('./Config/db');

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }))

app.use(cors());

app.use(morgan('common'));


app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on port : ${PORT}`);
});