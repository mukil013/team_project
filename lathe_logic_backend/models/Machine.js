const mongoose = require("mongoose");

const machineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  usageTime: {
    type: [
      {
        time: {
          type: Number,
        },
        date: { type: Date, default: new Date() },
      },
    ],
    required: true
  },
  serviceDate: {
    type: [Date], // Array of historical service dates
  },
  companyUid: { type: String, required: true },
});

const Machine = mongoose.model("Machine", machineSchema);
module.exports = Machine;
