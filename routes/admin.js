var express = require('express');
var router = express.Router();
const Controller = require('../Controller/admin')
const multer = require("multer");
const Authentication = require('../middleware/verifyToken')

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
router.get('/',Authentication,Controller.getAdmin)
router.get('/:id',Authentication,Controller.getAdminById)
router.put('/:id',Authentication,upload.single("image"),Controller.updateAdmin)
router.delete('/:id',Authentication,Controller.deleteAdmin)
router.post('/login',Controller.login)
module.exports = router;
