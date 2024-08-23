const Student = require('../Model/studentsModel');
const bcrypt = require('bcrypt');
// Calculate age from date of birth
const calculateAge = (dob) => {
    const diff = Date.now() - new Date(dob).getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
};

// Helper function to validate mobile number
const isValidMobileNumber = (number) => /^\d{10}$/.test(number);



// Get all students
exports.getAllStudents = async (req, res) => {
    try {
        // Get query parameters for pagination and search
        const { page = 1, limit = 10, name = '' } = req.query;

        // Convert page and limit to numbers
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);

        // Create a query object for name search
        const searchQuery = name ? { name: new RegExp(name, 'i') } : {};

        // Get students with pagination and search
        const students = await Student.find(searchQuery)
            .sort({ admissionDate: -1 })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)

        // Get total number of students for pagination
        const total = await Student.countDocuments(searchQuery);

        res.status(200).json({
            students,
            total,
            totalPages: Math.ceil(total / limitNumber),
            currentPage: pageNumber
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get a student by ID
exports.getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });
        res.status(200).json(student);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a student
exports.createStudent = async (req, res) => {
    try {
        const studentData = req.body;

        // Validate mobile number
        let mobileNumber = studentData.mobileNumber.trim(); // Trim any leading/trailing spaces
        if (!mobileNumber) {
            return res.status(400).json({ message: "Mobile number is required." });
        }

        // Convert mobile number to number
        const mobileNumberAsNumber = Number(mobileNumber);
        if (isNaN(mobileNumberAsNumber) || !isValidMobileNumber(mobileNumber)) {
            return res.status(400).json({ message: "Student mobile number is invalid. Must be a 10-digit number." });
        }

        // Validate parents' mobile number
        let parentsMobileNumber = studentData.parentsMobileNumber ? studentData.parentsMobileNumber.trim() : null;
        if (parentsMobileNumber && !isValidMobileNumber(parentsMobileNumber)) {
            return res.status(400).json({ message: "Invalid parents' mobile number. Must be a 10-digit number." });
        }

        // Check if mobile number already exists
        const existingStudent = await Student.findOne({ mobileNumber });
        if (existingStudent) {
            return res.status(400).json({ message: "Mobile number already used." });
        }
      // Check if invoice number already exists
      const existingInvoice = await Student.findOne({ invoiceNumber: studentData.invoiceNumber });
      if (existingInvoice) {
          return res.status(400).json({ message: "Invoice number already used." });
      }

        // Assign file paths to corresponding fields
        if (req.files.image) {
            studentData.image = req.files['image'] ? req.files['image'][0].filename : undefined;
        }
        if (req.files.guardianId) {
            studentData.guardianId = req.files['guardianId'] ? req.files['guardianId'][0].filename : undefined;
        }
        if (req.files.studentId) {
            studentData.studentId = req.files['studentId'] ? req.files['studentId'][0].filename : undefined;
        }

        studentData.age = calculateAge(studentData.dateOfBirth);

        // Generate password using date of birth in DDMMYYYY format
        const dateOfBirth = new Date(studentData.dateOfBirth);
        console.log(dateOfBirth,'this is the date of birth')
        const day = ('0' + dateOfBirth.getDate()).slice(-2);
        const month = ('0' + (dateOfBirth.getMonth() + 1)).slice(-2);
        const year = dateOfBirth.getFullYear();
        studentData.password = `${day}${month}${year}`;
        console.log(studentData.password,'the password')

        const student = new Student(studentData);
        const newStudent = await student.save();

        res.status(201).json(newStudent);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update a student
exports.updateStudent = async (req, res) => {
    try {
        const updatedData = req.body;

        // Validate mobile number if provided
        let mobileNumber = updatedData.mobileNumber ? updatedData.mobileNumber.trim() : null;
        if (mobileNumber && !isValidMobileNumber(mobileNumber)) {
            return res.status(400).json({ message: "Invalid mobile number. Must be a 10-digit number." });
        }

        // Validate parents' mobile number if provided
        let parentsMobileNumber = updatedData.parentsMobileNumber ? updatedData.parentsMobileNumber.trim() : null;
        if (parentsMobileNumber && !isValidMobileNumber(parentsMobileNumber)) {
            return res.status(400).json({ message: "Invalid parents' mobile number. Must be a 10-digit number." });
        }

        // Check if mobile number already exists
        if (mobileNumber) {
            const existingStudent = await Student.findOne({ mobileNumber, _id: { $ne: req.params.id } });
            if (existingStudent) {
                return res.status(400).json({ message: "Mobile number already used." });
            }
        }

        // Check if parents' mobile number already exists
        if (parentsMobileNumber) {
            const existingParent = await Student.findOne({ parentsMobileNumber, _id: { $ne: req.params.id } });
            if (existingParent) {
                return res.status(400).json({ message: "Parents' mobile number already used." });
            }
        }

        // Assign file paths to corresponding fields if files are provided
        if (req.files.image) {
            updatedData.image = req.files['image'] ? req.files['image'][0].filename : undefined;
        }
        if (req.files.guardianId) {
            updatedData.guardianId = req.files['guardianId'] ? req.files['guardianId'][0].filename : undefined;
        }
        if (req.files.studentId) {
            updatedData.studentId = req.files['studentId'] ? req.files['studentId'][0].filename : undefined;
        }

        // Update age if dateOfBirth is provided
        if (updatedData.dateOfBirth) {
            updatedData.age = calculateAge(updatedData.dateOfBirth);
        }

        // Update student in the database
        const updatedStudent = await Student.findByIdAndUpdate(req.params.id, updatedData, { new: true });
        if (!updatedStudent) return res.status(404).json({ message: 'Student not found' });

        res.status(200).json(updatedStudent);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete a student
exports.deleteStudent = async (req, res) => {
    try {
        const deletedStudent = await Student.findByIdAndDelete(req.params.id);
        if (!deletedStudent) return res.status(404).json({ message: 'Student not found' });
        res.status(200).json({ message: 'Student deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Sign-in student
exports.signInStudent = async (req, res) => {
    try {
        const { mobileNumber, password } = req.body;

        // Validate mobile number and password
        if (!mobileNumber || !password) {
            return res.status(400).json({ message: "Mobile number and password are required." });
        }

        // Find the student by mobile number
        const student = await Student.findOne({ mobileNumber });
        if (!student) {
            return res.status(400).json({ message: "Invalid mobile number." });
        }

        // Check if the password matches
        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password." });
        }

        // Generate a token for the student
        const token = student.generateAuthToken();

        res.status(200).json({ student, token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};