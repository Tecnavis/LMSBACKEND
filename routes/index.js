var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
const multer = require('multer');
const studentController = require('../Controller/studentsController');

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images');
    },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Route to upload Excel file and parse data
router.post('/upload', upload.single('excel'), studentController.uploadExcel);

module.exports = router;
