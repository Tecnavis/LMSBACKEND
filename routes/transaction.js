var express = require('express');
var router = express.Router();
const Controller = require('../Controller/transaction')
const PaymentModel = require('../Model/transaction')

// route to get the last receipt number
router.get('/last-receipt-number', async (req, res) => {
    try {
        const lastRecord = await PaymentModel.findOne().sort({ receiptNumber: -1 }).exec();
        res.json({ lastReceiptNumber: lastRecord ? lastRecord.receiptNumber : null });
    } catch (error) {
        res.status(500).send('Error fetching the last receipt number');
    }
});

router.post('/',Controller.create)
router.get('/',Controller.getAll)
router.delete('/:id',Controller.delete)
// router.get('/:id',Controller.getById)
module.exports = router;
