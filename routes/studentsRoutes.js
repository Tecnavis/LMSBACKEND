const express = require('express');
const router = express.Router();
const studentController = require('../Controller/studentsController');
var multer = require('multer')
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx')

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

router.get('/', studentController.getAllStudents);
router.get('/:id', studentController.getStudentById);
router.post('/', upload.fields([{ name: 'image', maxCount: 1 },{ name: 'guardianId', maxCount: 1 },{ name: 'studentId', maxCount: 1 }]),studentController.createStudent);
router.put('/:id',  upload.fields([{ name: 'image', maxCount: 1 },{ name: 'guardianId', maxCount: 1 },{ name: 'studentId', maxCount: 1 }]),studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);
router.post('/signin',studentController.signInStudent)

module.exports = router;
