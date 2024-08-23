const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://tecnaviswebsolutions:lPluqHGaRKMn6Zl6@lms.7iedft2.mongodb.net/?retryWrites=true&w=majority&appName=LMS');
        console.log('MongoDB Connected');
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
};

module.exports = connectDB;