// In your course model file
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    duration: { type: Number, required: true },
    fee: { type: Number, required: true },
    image: { type: String }
});

module.exports = mongoose.model('Course', courseSchema);
