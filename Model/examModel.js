const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    course: { type: String, required: true },
    location: { type: String, required: false }, // If not required
    description: { type: String, required: false }, // If not required
    student: { type: String, required: true },
    studentId: { type: String, required: false }, // If not required
    date: { type: Date, required: true },
});

const Item = mongoose.model('Exam', itemSchema);

module.exports = Item;