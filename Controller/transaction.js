const PaymentModel = require('../Model/transaction')
const asyncHandler = require("express-async-handler");

exports.create = asyncHandler(async (req, res) => {
    try {
        console.log('Received data:', req.body); // Log the data received from frontend

        const { students,receiptNumber, referenceNumber, date, name, balance, payAmount, modeOfPayment } = req.body;
        const payment = await PaymentModel.create({students, receiptNumber, referenceNumber, date, name, balance, payAmount, modeOfPayment });
        res.status(201).json(payment);
    } catch (error) {
        console.error('Error creating payment:', error); // Log any errors
        res.status(400).json({ message: error.message });
    }
});


exports.getAll = asyncHandler(async (req, res) => {
    try{
        const payments = await PaymentModel.find().populate("students");
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

// Route to get attendance records for a specific student
exports.getTransactionsByStudent = asyncHandler(async (req, res) => {
    try {
        const { studentId } = req.params;
        const payment = await PaymentModel.find({students: studentId}).populate('students');
        if (!payment) return res.status(404).json({ message: "Payment not found" });
        res.status(200).json(payment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

 //delete all payments

  exports.deleteAll = asyncHandler(async (req, res) => {
    try{
        const payment = await PaymentModel.deleteMany();
        if (!payment) return res.status(404).json({ message: "Payment not found" });
        res.status(200).json({ message: "Payment deleted" });
    }catch(error){
        res.status(500).json({message:error.message})
    }
})


exports.getMonthlyIncome = asyncHandler(async (req, res) => {
    try {
        const incomeData = await PaymentModel.aggregate([
            {
                $group: {
                    _id: { $month: "$date" }, // Group by the month from the 'date' field
                    totalPayAmount: { $sum: "$payAmount" }, // Sum the 'payAmount' for each month
                },
            },
            { $sort: { _id: 1 } }, // Sort by month (1 = January, 12 = December)
        ]);

        res.json(incomeData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
