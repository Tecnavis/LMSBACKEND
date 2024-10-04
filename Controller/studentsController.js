const Student = require("../Model/studentsModel");
const bcrypt = require("bcrypt");
const Logs = require("../Model/logsModel");
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
    const { page = 1, limit = 10, name = "" } = req.query;

    // Convert page and limit to numbers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Create a query object for name search
    const searchQuery = name ? { name: new RegExp(name, "i") } : {};

    // Get students with pagination and search
    const students = await Student.find(searchQuery)
      .sort({ admissionDate: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    // Get total number of students for pagination
    const total = await Student.countDocuments(searchQuery);

    res.status(200).json({
      students,
      total,
      totalPages: Math.ceil(total / limitNumber),
      currentPage: pageNumber,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a student by ID
exports.getStudentById = async (req, res) => {
  console.log(req.params,'this is the id')
  try {
    // Populate only selected fields from the 'course' model if needed
    const student = await Student.findById(req.params.id) // You can specify fields like 'name duration fee'
      .exec();

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

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
      return res.status(400).json({
        message: "Student mobile number is invalid. Must be a 10-digit number.",
      });
    }

    // Validate parents' mobile number
    let parentsMobileNumber = studentData.parentsMobileNumber
      ? studentData.parentsMobileNumber.trim()
      : null;
    if (parentsMobileNumber && !isValidMobileNumber(parentsMobileNumber)) {
      return res.status(400).json({
        message: "Invalid parents' mobile number. Must be a 10-digit number.",
      });
    }

    // Check if mobile number already exists
    const existingStudent = await Student.findOne({ mobileNumber });
    if (existingStudent) {
      return res.status(400).json({ message: "Mobile number already used." });
    }
    // Check if invoice number already exists
    const existingInvoice = await Student.findOne({
      invoiceNumber: studentData.invoiceNumber,
    });
    if (existingInvoice) {
      return res.status(400).json({ message: "Invoice number already used." });
    }

    // Assign file paths to corresponding fields
    if (req.files.image) {
      studentData.image = req.files["image"]
        ? req.files["image"][0].filename
        : undefined;
    }
    if (req.files.guardianId) {
      studentData.guardianId = req.files["guardianId"]
        ? req.files["guardianId"][0].filename
        : undefined;
    }
    if (req.files.studentId) {
      studentData.studentId = req.files["studentId"]
        ? req.files["studentId"][0].filename
        : undefined;
    }

    studentData.age = calculateAge(studentData.dateOfBirth);

    // Generate password using date of birth in DDMMYYYY format
    const dateOfBirth = new Date(studentData.dateOfBirth);
    const day = ("0" + dateOfBirth.getDate()).slice(-2);
    const month = ("0" + (dateOfBirth.getMonth() + 1)).slice(-2);
    const year = dateOfBirth.getFullYear();
    studentData.password = `${day}${month}${year}`;

    const student = new Student(studentData);
    const newStudent = await student.save();

    // Log success
    const logEntry = new Logs({
      log: `${studentData.adminName} created ${studentData.name}.`,
      time: new Date(),
      status: "Created",
    });
    await logEntry.save();

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
    let mobileNumber = updatedData.mobileNumber
      ? updatedData.mobileNumber.trim()
      : null;

    // Validate parents' mobile number if provided
    let parentsMobileNumber = updatedData.parentsMobileNumber
      ? updatedData.parentsMobileNumber.trim()
      : null;

    if (mobileNumber && !isValidMobileNumber(mobileNumber)) {
      return res
        .status(400)
        .json({ message: "Invalid mobile number. Must be a 10-digit number." });
    }

    // Check if mobile number already exists
    if (mobileNumber) {
      const existingStudent = await Student.findOne({
        mobileNumber,
        _id: { $ne: req.params.id },
      });
      if (existingStudent) {
        return res.status(401).json({ message: "Mobile number already used." });
      }
    }

    // Sanitize joinDate
    if (updatedData.joinDate === "null" || !Date.parse(updatedData.joinDate)) {
      updatedData.joinDate = null;
    } else {
      updatedData.joinDate = new Date(updatedData.joinDate);
    }

    // Sanitize dateOfBirth
    if (
      updatedData.dateOfBirth === "null" ||
      !Date.parse(updatedData.dateOfBirth)
    ) {
      updatedData.dateOfBirth = null;
    } else {
      updatedData.dateOfBirth = new Date(updatedData.dateOfBirth);
    }

    // Handle file uploads
    if (req.files) {
      if (req.files.image) {
        updatedData.image = req.files["image"][0].filename;
      }
      if (req.files.guardianId) {
        updatedData.guardianId = req.files["guardianId"][0].filename;
      }
      if (req.files.studentId) {
        updatedData.studentId = req.files["studentId"][0].filename;
      }
    }

    // Update age if dateOfBirth is provided
    if (updatedData.dateOfBirth) {
      updatedData.age = parseInt(calculateAge(updatedData.dateOfBirth), 10);
    }

    // Update student in the database
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );
    if (!updatedStudent)
      return res.status(404).json({ message: "Student not found" });

    const logEntry = new Logs({
      log: `${updatedData.adminName} updated ${updatedData.name}.`,
      time: new Date(),
      status: "Updated",
    });
    await logEntry.save();

    res.status(200).json(updatedStudent);
  } catch (err) {
    console.error("Update student error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Delete a student
exports.deleteStudent = async (req, res) => {
  const { adminName } = req.query; // Use req.query to access query parameters
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    if (!deletedStudent)
      return res.status(404).json({ message: "Student not found" });

    const logEntry = new Logs({
      log: `${adminName} deleted ${deletedStudent.name}.`,
      time: new Date(),
      status: "Deleted",
    });
    await logEntry.save();
    res.status(200).json({ message: "Student deleted" });
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
      return res
        .status(400)
        .json({ message: "Mobile number and password are required." });
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

////
const XLSX = require("xlsx");

const moment = require("moment");

const parseDate = (dateStr) => {
  // Adjust the format to match your date strings
  const formats = [
    "DD/MM/YYYY", // Example format
    "MM/DD/YYYY",
    "YYYY-MM-DD",
    "YYYY/MM/DD",
  ];
  for (const format of formats) {
    const momentDate = moment(dateStr, format, true);
    if (momentDate.isValid()) {
      return momentDate.toDate();
    }
  }
  // Default case if no formats matched
  return null;
};

exports.uploadExcel = async (req, res) => {
  try {
    if (!req.file) {
      console.log("No file uploaded.");
      return res.status(400).send("No file uploaded.");
    }

    const filePath = req.file.path;

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);


    const students = sheetData.map((data) => {
      return {
        admissionDate: parseDate(data["Admission Date"]),
        invoiceNumber: data["Invoice Number"],
        name: data.Name,
        fullAddress: data.Address,
        state: data.State,
        pinCode: data["Pin Code"],
        bloodGroup: data["Blood Group"],
        guardianName: data["Guardian Name"],
        guardianRelation: data["Guardian Relation"],
        dateOfBirth: parseDate(data["Date of Birth"]),
        age: data.Age,
        gender: data.Gender,
        maritalStatus: data["Marital Status"],
        academicQualification: data.Qualification,
        mobileNumber: data["Mobile Number"],
        parentsMobileNumber: data["Parent's Mobile"],
        email: data.Email,
        courseName: data["Course Name"],
        joinDate: parseDate(data["Join Date"]),
        courseFee: data["Course Fee"],
        guardianId: data["Guardian ID"],
        studentId: data["Student ID"],
      };
    });


    await Student.insertMany(students);

    res.status(200).send("Students uploaded and saved successfully.");
  } catch (error) {
    console.error("Error in uploadExcel:", error);
    res.status(500).send("An error occurred while uploading the file.");
  }
};
//updating Course Fee
exports.updateStudentBalance = async (req, res) => {
  const { id } = req.params;
  const { balance } = req.body;
  try {
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    // Update balance and courseFee
    student.balance = balance;
    student.courseFee = balance;
    await student.save();
    res
      .status(200)
      .json({ message: "Student balance and course fee updated successfully" });
  } catch (error) {
    console.error("Error updating student balance:", error);
    res.status(500).json({ message: "Error updating student balance", error });
  }
};

//  activate student

exports.activateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).send({ error: "Student not found" });
    }

    student.active = true;
    await student.save();

    res.send({ success: true, active: student.active });
  } catch (error) {
    res.status(500).send({ error: "Something went wrong" });
  }
};

//  deactivate student
exports.deactivate = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).send({ error: "Student not found" });
    }

    // Set active status to false and save the deactivation reason.
    student.active = false;
    student.deactivationReason = req.body.reason; // Get reason from request body
    await student.save();

    res.send({ success: true, active: student.active });
  } catch (error) {
    res.status(500).send({ error: "Something went wrong" });
  }
};
