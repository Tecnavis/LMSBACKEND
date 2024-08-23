const mongoose = require('mongoose');
const courseSchema = new mongoose.Schema({
    name: { type: String  },
    duration: { type: Number }
});

courseSchema.pre('save', async function(next) {
    const course = this;
    // Convert name to uppercase
    if (course.isModified('name')) {
        course.name = course.name.toUpperCase();
    }

    next();
});

module.exports = mongoose.model('Course', courseSchema);
