const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  assignedTo: { type: String, required: true },
  eta: { type: String, required: true },
  priority: { type: String, enum: ["high", "medium", "low"], required: true },
  column: {
    type: String,
    enum: ["todo", "inProgress", "completed"],
    required: true,
  },
  companyUid: { type: String, required: true },
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
