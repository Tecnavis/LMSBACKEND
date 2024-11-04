const PaymentModel = require('../Model/transaction')
const asyncHandler = require("express-async-handler");
const Logs = require('../Model/logsModel')
const studentsModel = require('../Model/studentsModel')


exports.create = asyncHandler(async (req, res) => {
    try {

        const { students,receiptNumber, referenceNumber, date, name, balance, payAmount, modeOfPayment, adminName } = req.body;
        const payment = await PaymentModel.create({students, receiptNumber, referenceNumber, date, name, balance, payAmount, modeOfPayment });
        const logEntry = new Logs({
            log: `${adminName} received ₹${payAmount} from ${name} by ${modeOfPayment}`,
            time: new Date(),
            status: "Created"
          });
          await logEntry.save();
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

exports.getTranstactionById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    console.log(req.params,'this is the params')

    try {
        const response = await PaymentModel.findById(id);
        if (!response) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while getting transaction by id');
    }
});



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

//   exports.deleteAll = asyncHandler(async (req, res) => {
//     try{
//         const payment = await PaymentModel.deleteMany();
//         if (!payment) return res.status(404).json({ message: "Payment not found" });
//         res.status(200).json({ message: "Payment deleted" });
//     }catch(error){
//         res.status(500).json({message:error.message})
//     }
// })


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


// exports.UpdateTransaction = asyncHandler(async(req,res)=>{
//     const { id } = req.params;
//   const { payAmount, modeOfPayment, referenceNumber, date , students} = req.body;

//   try {
//     // Find the transaction by ID
//     const transaction = await PaymentModel.findById(id);

//     if (!transaction) {
//       return res.status(404).json({ message: 'Transaction not found' });
//     }

//     // Update the payAmount in the transaction
//     if (payAmount) {
//       transaction.payAmount = payAmount; // Update payAmount in the transaction
//     }

//     // Update other fields if they are provided
//     if (modeOfPayment) transaction.modeOfPayment = modeOfPayment;
//     if (referenceNumber) transaction.referenceNumber = referenceNumber;
//     if (date) transaction.date = date;

//     // Save the updated transaction
//     await transaction.save();

//     // Update the courseFee in the students model
//     if (transaction.students) {
//       const student = await studentsModel.findById(students);

//       if (student) {
//         student.courseFee + payAmount; // Adjust courseFee as needed
//         await student.save();
//       } else {
//         return res.status(404).json({ message: 'Student not found' });
//       }
//     }

//     return res.status(200).json({ message: 'Transaction and student course fee updated successfully', transaction });
//   } catch (error) {
//     return res.status(500).json({ message: `Error updating transaction: ${error.message}` });
//   }
// })


exports.UpdateTransaction = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { payAmount, modeOfPayment, referenceNumber, date, students } = req.body;

    try {
        const transaction = await PaymentModel.findById(id);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        if (payAmount > transaction.payAmount) {
            const difference = payAmount - transaction.payAmount;
            const student = await studentsModel.findById(students);
            if (student) {
                // Update the student's course fee
                student.courseFee -= difference;
                await student.save();

                // Update the transaction details
                transaction.date = date;
                transaction.referenceNumber = referenceNumber;
                transaction.payAmount = payAmount;
                transaction.modeOfPayment = modeOfPayment;

                // Save the updated transaction
                await transaction.save();

                return res.status(200).json({ message: 'Transaction updated successfully', transaction });
            } else {
                return res.status(404).json({ message: 'Student not found' });
            }
        } else if(payAmount < transaction.payAmount) {
            const difference = transaction.payAmount - payAmount;
            const student = await studentsModel.findById(students);
            if (student) {
                // Update the student's course fee
                student.courseFee += difference;
                await student.save();

                // Update the transaction details
                transaction.date = date;
                transaction.referenceNumber = referenceNumber;
                transaction.payAmount = payAmount;
                transaction.modeOfPayment = modeOfPayment;

                // Save the updated transaction
                await transaction.save();

                return res.status(200).json({ message: 'Transaction updated successfully', transaction });
            } else {
                return res.status(404).json({ message: 'Student not found' });
            }
        } else {
            transaction.date = date;
            transaction.referenceNumber = referenceNumber;
            transaction.payAmount = payAmount;
            transaction.modeOfPayment = modeOfPayment;
            await transaction.save();
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
});


exports.delteTransaction = asyncHandler(async(req,res)=>{
    const {id} = req.params
    try {
        const transaction = await PaymentModel.findById(id)
        const students = await studentsModel.findById(transaction.students)

        students.courseFee += transaction.payAmount
        await students.save()
        await PaymentModel.findByIdAndDelete(id);
        res.status(200).send('the transaction deleted successfully')
    } catch (error) {
        console.error(error)
        res.status(500).send('some error while deleting transaction')
    }
})