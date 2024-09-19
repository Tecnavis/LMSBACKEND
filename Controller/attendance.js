const Attendance = require('../Model/attendance');
const Student = require('../Model/studentsModel')

exports.getAll = async (req, res) => {
  try {
    const attendance = await Attendance.find().populate('students');
    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

//delete attendance
exports.delete = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) return res.status(404).json({ error: 'Attendance not found' });
    res.status(200).json({ message: 'Attendance deleted successfully' });   
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}


// Get attendance records for a specific student
exports.getAttendanceByStudent = async (req, res) => {
    try {
      const { studentId } = req.params; // Assuming studentId is passed in the URL
      const attendance = await Attendance.find({ students: studentId }).populate('students');
      res.status(200).json(attendance);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  //delete all attendance
  exports.deleteAll = async (req, res) => {
    try {
      const attendance = await Attendance.deleteMany();
      if (!attendance) return res.status(404).json({ error: 'Attendance not found' });
      res.status(200).json({ message: 'Attendance deleted successfully' });   
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }


  // Fetch attendance records for a specific date
exports.getAttendanceByDate = async (req, res) => {
    const { date } = req.params;

    try {
        const attendanceRecords = await Attendance.find({ date })
            .populate('students', 'name courseName') // Populate student details
            .exec();
        
        res.status(200).json({ attendanceRecords });
    } catch (error) {
        console.error('Error fetching attendance records:', error);
        res.status(500).json({ message: 'Error fetching attendance records' });
    }
};

// Update attendance record
exports.updateAttendance = async (req, res) => {
    const { students, date, status } = req.body;

    try {
        const existingRecord = await Attendance.findOne({ students, date });
        if (existingRecord) {
            existingRecord.status = status;
            await existingRecord.save();
        } else {
            const newRecord = new Attendance({ students, date, status });
            await newRecord.save();
        }

        res.status(200).json({ message: 'Attendance updated successfully' });
    } catch (error) {
        console.error('Error updating attendance:', error);
        res.status(500).json({ message: 'Error updating attendance' });
    }
};


//get monthly records for all student

exports.getMonthlyAttendance = async (req, res) => {
    const { studentId, month, year } = req.params;
  
    // Ensure that the year and month are valid
    const parsedYear = Number(year);
    const parsedMonth = Number(month);
  
    if (isNaN(parsedYear) || isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
      return res.status(400).json({ message: 'Invalid year or month' });
    }
  
    try {
        // Adjust date range for the query
        const startDate = new Date(parsedYear, parsedMonth - 1, 1); // First day of the month
        const endDate = new Date(parsedYear, parsedMonth, 1); // First day of the next month
  
        const attendanceRecords = await Attendance.find({
          date: { $gte: startDate, $lt: endDate } // Date range filter
        })
        .populate('students', 'name') // Populate student details
        .exec();
  
        res.status(200).json({ attendanceRecords });
    } catch (error) {
        console.error('Error fetching monthly attendance records:', error);
        res.status(500).json({ message: 'Error fetching monthly attendance records' });
    }
  };
  
  exports.updateAttendanceStatus = async (req, res) => {
    const { fromDate, toDate } = req.body;
  
    try {
      // Convert dates to Date objects
      const start = new Date(fromDate);
      const end = new Date(toDate);
      end.setDate(end.getDate() + 1); // Include the 'toDate'
  
      // Fetch all students
      const students = await Student.find().select('_id'); // Fetch all student IDs
  
      if (students.length === 0) {
        return res.status(400).send('No students found');
      }
  
      const datesToCheck = [];
      let currentDate = new Date(start);
      while (currentDate < end) {
        datesToCheck.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
  
      // Check for existing holidays
      const existingHolidayRecords = await Attendance.find({
        date: { $in: datesToCheck },
        status: 'Holiday',
      });
  
      const existingHolidayDates = new Set(existingHolidayRecords.map(record => record.date.toISOString()));
  
      // Create new holiday records only for non-holiday dates
      const newRecords = datesToCheck
        .filter(date => !existingHolidayDates.has(date.toISOString())) // Filter out dates that already have holidays
        .flatMap(date =>
          students.map(student => ({
            students: student._id,
            date,
            status: 'Holiday'
          }))
        );
  
      if (newRecords.length > 0) {
        await Attendance.insertMany(newRecords);
      }
  
      // Update the status to 'Holiday' only for non-holiday dates
      await Attendance.updateMany(
        { date: { $gte: start, $lt: end }, status: { $ne: 'Holiday' } }, // Skip dates where the status is already 'Holiday'
        { $set: { status: 'Holiday' } }
      );
  
      res.status(200).send('Attendance updated successfully');
    } catch (error) {
      console.error('Error updating attendance:', error);
      res.status(500).send('Server error');
    }
  };
  
  // exports.updateAttendanceStatus = async (req, res) => {
  //   const { fromDate, toDate } = req.body;
  
  //   try {
  //     // Convert dates to Date objects
  //     const start = new Date(fromDate);
  //     const end = new Date(toDate);
  //     end.setDate(end.getDate() + 1);
  
  //     // Fetch all students
  //     const students = await Student.find().select('_id'); // Fetch all student IDs
  
  //     if (students.length === 0) {
  //       return res.status(400).send('No students found');
  //     }
  
  //     const datesToCheck = [];
  //     let currentDate = new Date(start);
  //     while (currentDate < end) {
  //       datesToCheck.push(new Date(currentDate));
  //       currentDate.setDate(currentDate.getDate() + 1);
  //     }
  
  //     const newRecords = datesToCheck.flatMap(date =>
  //       students.map(student => ({
  //         students: student._id,
  //         date,
  //         status: 'Holiday'
  //       }))
  //     );
  
  //     if (newRecords.length > 0) {
  //       await Attendance.insertMany(newRecords);
  //     }
  
  //     await Attendance.updateMany(
  //       { date: { $gte: start, $lt: end } },
  //       { $set: { status: 'Holiday' } }
  //     );
  
  //     res.status(200).send('Attendance updated successfully');
  //   } catch (error) {
  //     console.error('Error updating attendance:', error);
  //     res.status(500).send('Server error');
  //   }
  // };


// Controller function to get all holidays
// exports.getAllHolidays = async (req, res) => {
//   try {
//     const holidays = await Attendance.find({ status: 'Holiday' });
//     res.status(200).json(holidays);
//   } catch (error) {
//     console.error('Error fetching holidays:', error);
//     res.status(500).send('Server error');
//   }
// };

// Controller to fetch holiday records
// exports.getHolidayRecords = async (req, res) => {
//   const { fromDate, toDate } = req.query;

//   // Validate dates
//   if (!fromDate || isNaN(Date.parse(fromDate)) || !toDate || isNaN(Date.parse(toDate))) {
//     return res.status(400).json({ message: "Invalid date format" });
//   }

//   try {
//     // Convert dates to Date objects
//     const start = new Date(fromDate);
//     const end = new Date(toDate);

//     // Ensure the end date is inclusive by adding 1 day to the end date
//     end.setDate(end.getDate() + 1);

//     // Query to fetch holidays within the date range
//     const holidays = await Attendance.find({
//       date: { $gte: start, $lt: end },
//       status: 'Holiday'
//     }).populate('student', 'name'); // Populating the student details (optional)

//     // Check if any holidays were found
//     if (!holidays.length) {
//       return res.status(404).json({ message: "No holidays found in the given range" });
//     }

//     // Return the holidays in the response
//     res.status(200).json(holidays);
//   } catch (error) {
//     console.error('Error fetching holiday records:', error);
//     res.status(500).json({ message: 'Server error while fetching holidays' });
//   }
// };
