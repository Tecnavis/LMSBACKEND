const Course = require('../Model/courseModel');

// Create a new course
// In your courseController.js
exports.createCourse = async (req, res) => {

    const image = req.file ? req.file.filename : undefined;
    const { name, duration, fee } = req.body;

    // Check if req.body contains expected data
    if (!name || !duration || !fee) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const courseData = {
            name,
            duration: Number(duration),
            fee: Number(fee),
            image
        };


        const course = new Course(courseData); // Create course using the model
        await course.save();
        res.status(201).json(course);
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({ error: error.message });
    }
};



// Get all courses
exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find();
        res.status(200).json(courses);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get a single course by ID
exports.getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ error: 'Course not found' });
        res.status(200).json(course);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update a course by ID
exports.updateCourse = async (req, res) => {
    try {
        // Extract the updated data and the image if available
        const updatedData = { ...req.body };

        // Check if there's a new image and update the image field accordingly
        if (req.file) {
            updatedData.image = req.file ? req.file.filename : undefined; // Save the path of the uploaded image
        }

        const course = await Course.findByIdAndUpdate(req.params.id, updatedData, { new: true });
        
        if (!course) return res.status(404).json({ error: 'Course not found' });
        
        res.status(200).json(course);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


// Delete a course by ID
exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) return res.status(404).json({ error: 'Course not found' });
        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
