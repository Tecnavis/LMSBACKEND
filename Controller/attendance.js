const Attendance = require('../Model/attendance');

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

