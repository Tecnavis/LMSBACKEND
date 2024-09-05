const PaymentModel = require('../Model/transaction')
const asyncHandler = require("express-async-handler");

exports.create = asyncHandler(async (req, res) => {
    const { receiptNumber, referenceNumber, date, name, balance, payAmount, modeOfPayment } = req.body;
    try {
        const payment = new PaymentModel({
            receiptNumber,
            referenceNumber,
            date,
            name,
            balance,
            payAmount,
            modeOfPayment
        });
        const newPayment = await payment.save();
        res.status(201).json({ newPayment });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
})

exports.getAll = asyncHandler(async (req, res) => {
    try{
        const payments = await PaymentModel.find();
        res.json(payments);
    }catch(error){  
        res.status(500).json({message:error.message})
    }
})

exports.delete = asyncHandler(async (req, res) => {
    try{
        const payment = await PaymentModel.findByIdAndDelete(req.params.id);
        if (!payment) return res.status(404).json({ message: "Payment not found" });
        res.status(200).json({ message: "Payment deleted" });
    }catch(error){
        res.status(500).json({message:error.message})
    }
})

// In Controller/transaction.js
// exports.getById = asyncHandler(async (req, res) => {
//     console.log(`Fetching transaction with ID: ${req.params.id}`);
//     const {id} = req.params;
//     try {
//         const payment = await PaymentModel.find({students:id}).populate("students");
//         if (!payment) return res.status(404).json({ message: "Payment not found" });
//         res.status(200).json({payments: payment });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

