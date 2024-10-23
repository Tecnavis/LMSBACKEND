var express = require('express');
var router = express.Router();
const Controller = require('../Controller/transaction')
const PaymentModel = require('../Model/transaction')
const Authentication = require('../middleware/verifyToken')

// route to get the last receipt number
router.get('/last-receipt-number', async (req, res) => {
    try {
        const lastRecord = await PaymentModel.findOne().sort({ receiptNumber: -1 }).exec();
        res.json({ lastReceiptNumber: lastRecord ? lastRecord.receiptNumber : null });
    } catch (error) {
        res.status(500).send('Error fetching the last receipt number');
    }
});

router.post('/',Authentication,Controller.create)
router.get('/',Controller.getAll)
router.delete('/:id',Controller.delteTransaction)
router.get('/student/:studentId', Controller.getTransactionsByStudent);
router.get('/:id',Authentication,Controller.getTranstactionById)
// router.delete('/',Controller.deleteAll)
router.get('/monthly-income', Controller.getMonthlyIncome);
router.put('/:id',Controller.UpdateTransaction)
module.exports = router;
