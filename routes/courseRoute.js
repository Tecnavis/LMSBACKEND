const express = require('express');
const multer = require('multer');
const router = express.Router();
const courseController = require('../Controller/courseController');

// Configure multer for file storage
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images'); // Change to your desired directory
    },
    filename: function (req, file, cb) {
        const fileExtension = file.originalname.split('.').pop();
        const uniqueFilename = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.' + fileExtension;
        cb(null, uniqueFilename);
    }
});

var upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG and PNG files are allowed.'));
        }
    }
});

// Define routes
router.post('/', upload.single('image'), courseController.createCourse); // Create course
router.get('/', courseController.getAllCourses); // Get all courses
router.get('/:id', courseController.getCourseById); // Get course by ID
router.put('/:id', upload.single('image'), courseController.updateCourse); // Update course with image
router.delete('/:id', courseController.deleteCourse); // Delete course

module.exports = router;
