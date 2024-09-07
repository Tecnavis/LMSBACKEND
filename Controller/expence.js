const asyncHandler = require("express-async-handler");
const Models = require("../Model/expence");


const getNextReceiptNumber = async () => {
    const lastRecord = await Models.findOne().sort({ _id: -1 }).limit(1);
    let nextReceiptNumber = 'REC00001';
    if (lastRecord && lastRecord.receiptNumber) {
      const currentNumber = parseInt(lastRecord.receiptNumber.replace('REC', ''));
      const nextNumber = currentNumber + 1;
      nextReceiptNumber = `REC${nextNumber.toString().padStart(5, '0')}`;
    }
    return nextReceiptNumber;
  };
  
// Create payment
exports.create = asyncHandler(async (req, res) => {
    const {
      date,
      amount,
      description,
      referenceNumber,
      modeOfPayment,
    } = req.body;
  
    if (!date || !amount || !description || !modeOfPayment) {
      res.status(400);
      throw new Error("Please add all fields");
    }
  
    // Get the next receipt number
    const receiptNumber = await getNextReceiptNumber();
  
    let image = null;
    if (req.file) {
      image = req.file.filename;
    }
  
    const expence = await Models.create({
      receiptNumber,
      referenceNumber,
      date,
      amount,
      modeOfPayment,
      description,
      image,
    });
  
    if (expence) {
      res.status(201).json({
        _id: expence._id,
        receiptNumber: expence.receiptNumber,
        date: expence.date,
        amount: expence.amount,
        description: expence.description,
        modeOfPayment: expence.modeOfPayment,
        image: expence.image,
      });
    } else {
      res.status(400);
      throw new Error("Invalid data");
    }
  });
  

// Get all payments
exports.getAll = asyncHandler(async (req, res) => {
  const expences = await Models.find();
  res.json(expences);
});

//get expence by id
exports.getExpenceById = asyncHandler(async (req, res) => {
  const expence = await Models.findById(req.params.id);
  if (!expence) {
    res.status(400);
    throw new Error("Expence not found");
  }
  res.json(expence);
});

// Update payment

exports.updateExpence = asyncHandler(async (req, res) => {
  const {
    referenceNumber,
    date,
    amount,
    description,
    modeOfPayment,
  } = req.body;
  const expence = await Models.findById(req.params.id);
  if (!expence) {
    res.status(400);
    throw new Error("Expence not found");
  }
  expence.referenceNumber = referenceNumber;
  expence.date = date;
  expence.amount = amount;
  expence.description = description;
  expence.modeOfPayment = modeOfPayment;
  if (req.file) {
    expence.image = req.file.filename;
  }
  const updatedExpence = await expence.save();
  res.json(updatedExpence);
});
// delete payment by id
exports.delete = asyncHandler(async (req, res) => {
  try {
    const payment = await Models.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.status(200).json({ message: "Payment deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
