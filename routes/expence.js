var express = require('express');
var router = express.Router();
const Controller = require('../Controller/expence')
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
router.get('/',Controller.getAll)
router.get('/:id',Controller.getExpenceById)
router.put('/:id',upload.single("image"),Controller.updateExpence)
router.delete('/:id',Controller.delete)
router.get('/summary/monthly', Controller.getMonthlyExpenses);
module.exports = router;
