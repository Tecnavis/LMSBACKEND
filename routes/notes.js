const express = require('express');
const router = express.Router();
const Controller = require('../Controller/notes');

// Define routes
router.post('/', Controller.create);
router.get('/', Controller.getAll);
router.get('/:id', Controller.getById);
router.put('/:id', Controller.update);
router.delete('/:id', Controller.delete);

module.exports = router;
