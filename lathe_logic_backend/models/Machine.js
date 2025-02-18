// models/Machine.js
const mongoose = require('mongoose');

const machineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  usageTime: { type: Number, required: true },
  serviceTime: { type: Number, required: true },
  maintenanceTime: { type: Number, required: true },
  companyUid: { type: String, required: true },
});

const Machine = mongoose.model('Machine', machineSchema);

module.exports = Machine;