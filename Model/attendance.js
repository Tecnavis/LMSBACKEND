const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  students: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Holiday'],
    required: true,
  }

});

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
