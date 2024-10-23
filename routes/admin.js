var express = require('express');
var router = express.Router();
const Controller = require('../Controller/admin')
const multer = require("multer");
const Authentication = require('../middleware/verifyToken');
const { getTranstactionById } = require('../Controller/transaction');

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

router.post('/',upload.single("image"),Controller.create)
router.get('/',Authentication,Controller.getAdmin)
router.get('/:id',Authentication,Controller.getAdminById)

router.put('/:id',Authentication,upload.single("image"),Controller.updateAdmin)
router.delete('/:id',Authentication,Controller.deleteAdmin)
router.post('/login',Controller.login)
module.exports = router;
