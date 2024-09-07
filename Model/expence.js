const mongoose = require("mongoose");

const expenceSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  receiptNumber: { type: String, required: true },
  referenceNumber: { type: String },
  date: {
    type: Date,
    default: Date.now,
  },
  image: { type: String },
  description: { type: String },
  modeOfPayment: { type: String, enum: ["UPI", "Cash"] },
});
module.exports = mongoose.model("Expence", expenceSchema);
