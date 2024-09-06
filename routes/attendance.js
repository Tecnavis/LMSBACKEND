const express = require('express');
const router = express.Router();
const Controller = require('../Controller/attendance');

// Route to save or update attendance
// router.post('/', Controller.saveAttendance);

// Route to get all attendance records
router.get('/', Controller.getAll);

// Route to delete attendance record
router.delete('/:id', Controller.delete);

// Route to get attendance record by ID
// router.get('/:id', Controller.getById);

// Route to deleteall attendance records
router.delete('/', Controller.deleteAll);
// Route to get attendance records for a specific student
router.get('/student/:studentId', Controller.getAttendanceByStudent);

// Route to fetch attendance by date
router.get('/:date', Controller.getAttendanceByDate);

// Route to update attendance
router.post('/', Controller.updateAttendance);
module.exports = router;
