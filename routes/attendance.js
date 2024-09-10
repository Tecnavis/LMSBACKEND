const express = require('express');
const router = express.Router();
const Controller = require('../Controller/attendance');
const Authentication = require('../middleware/verifyToken')


// Route to get all attendance records
router.get('/', Controller.getAll);

// Route to delete attendance record
router.delete('/:id', Controller.delete);

// Route to deleteall attendance records
router.delete('/', Controller.deleteAll);

// Route to get attendance records for a specific student
router.get('/student/:studentId', Controller.getAttendanceByStudent);

// Route to fetch attendance by date
router.get('/:date', Controller.getAttendanceByDate);

// Route to update attendance
router.post('/', Controller.updateAttendance);

//Route to get monthly records for all student
router.get('/:month/:year', Controller.getMonthlyAttendance);
router.post('/update-attendance', Controller.updateAttendanceStatus);
// router.get('/day/holidays', Controller.getAllHolidays);

// router.get('/holidays',Controller.getHolidayRecords);

module.exports = router;
