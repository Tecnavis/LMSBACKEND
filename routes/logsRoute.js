const express = require('express')
var router = express.Router();
const logsController = require('../Controller/logsController')


router.get('/',logsController.getLogs)

module.exports = router;