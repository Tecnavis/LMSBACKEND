const mongoose = require("mongoose");

const logsSchema = new mongoose.Schema({
  log: {
    type: String,
    required: true,
  },
  time: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Created', 'Updated', 'Deleted'],
    required: true,
  }
});
module.exports = mongoose.model("Logs", logsSchema);
