const mongoose = require('mongoose');

const expenceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    priority: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        required: true,
      }
});
module.exports = mongoose.model('Notes', expenceSchema)