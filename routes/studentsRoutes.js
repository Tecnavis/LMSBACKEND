const express = require('express');
const router = express.Router();
const studentController = require('../Controller/studentsController');
var multer = require('multer')
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx')
const Authentication = require('../middleware/verifyToken')

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images');
    },
    filename: function (req, file, cb) {
        // Preserve the file extension
        const fileExtension = file.originalname.split('.').pop();
        // Generate a unique filename
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

router.get('/',Authentication, studentController.getAllStudents);
router.get('/:id',Authentication, studentController.getStudentById);
router.post('/',Authentication, upload.fields([{ name: 'image', maxCount: 1 },{ name: 'guardianId', maxCount: 1 },{ name: 'studentId', maxCount: 1 }]),studentController.createStudent);
router.put('/:id', Authentication, upload.fields([{ name: 'image', maxCount: 1 },{ name: 'guardianId', maxCount: 1 },{ name: 'studentId', maxCount: 1 }]),studentController.updateStudent);
router.delete('/:id',Authentication, studentController.deleteStudent);
router.post('/signin',Authentication,studentController.signInStudent)
router.patch('/:id',Authentication,studentController.updateStudentBalance);
router.put('/activate/:id',Authentication,studentController.activateStudent)
router.put('/deactivate/:id',Authentication,studentController.deactivate)

module.exports = router;
