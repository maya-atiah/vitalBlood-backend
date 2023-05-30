const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
require('dotenv').config();
const connectDB = require('./Config/db');
const user = require('./Routes/UserRoutes');
const bodyParser = require('body-parser');
const donation = require('./Routes/DonationRoutes');
const PORT = process.env.PORT || 3000;

// app.use(express.json());
// app.use(express.urlencoded({ extended: false }))
app.use('/images', express.static('images'))

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));



app.use(cors());

app.use(morgan('common'));

app.use("/api/user", user);
app.use('/api/donation', donation)


app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on port : ${PORT}`);
});