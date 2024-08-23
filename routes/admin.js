var express = require('express');
var router = express.Router();
const Controller = require('../Controller/admin')
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

var upload = multer({ storage: storage });
router.post('/',upload.single("image"),Controller.create)
router.get('/',Controller.getAdmin)
router.get('/:id',Controller.getAdminById)
router.put('/:id',upload.single("image"),Controller.updateAdmin)
router.delete('/:id',Controller.deleteAdmin)
router.post('/login',Controller.login)
module.exports = router;
