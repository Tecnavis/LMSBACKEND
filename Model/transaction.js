const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  students: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  receiptNumber: { type: String, required: true },
  referenceNumber: { type: String },
  date: { type: Date, required: true },
  name: { type: String, required: true },
  balance: { type: Number, required: true },
  payAmount: { type: Number, required: true },
  modeOfPayment: { type: String, enum: ["UPI", "Cash"], required: true },
});

module.exports = mongoose.model("Transaction", transactionSchema);
