const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { mongoURI, rateLimitConfig } = require('./config/config');
const compression = require('compression');
//response compression
const rateLimit = require('express-rate-limit');
//rateLimiter
const helmet = require('helmet');
//for security

//Routes import--------
const authRoutes = require('./routes/authRoutes/authRoutes');

//Routes import--------


const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });


const limiter = rateLimit(rateLimitConfig);


//Middlewares basic-------------
app.use(bodyParser.json());
app.use(compression());
app.use(helmet());
//Middlewares basic-------------


//limiter middlewares-----------
app.use('/auth', limiter);
//limiter middlewares-----------


//Routes-----------------------
app.use('/auth', authRoutes);
//Routes-----------------------


app.listen(PORT, () => {
    console.log(`Server listening on PORT : ${PORT}`);
})