const mongoose = require('mongoose');
const courseSchema = new mongoose.Schema({
    name: { type: String  },
    duration: { type: Number },
    fee: { type: Number },
});


module.exports = mongoose.model('Course', courseSchema);
