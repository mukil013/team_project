const express = require('express');
const Task = require('../models/Task');
const router = express.Router();

// Get all tasks
router.get('/tasks/:companyUid', async (req, res) => {
  const { companyUid } = req.params;

  try {
    const tasks = await Task.find({ companyUid });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new task
router.post('/tasks', async (req, res) => {
  const { id, name, description, assignedTo, eta, priority, column, companyUid } = req.body;

  try {
    const newTask = new Task({
      id,
      name,
      description,
      assignedTo,
      eta,
      priority,
      column,
      companyUid,
    });

    await newTask.save();
    res.status(201).json({ message: 'Task added successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a task
router.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, assignedTo, eta, priority, column } = req.body;

  try {
    const task = await Task.findOne({ id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.name = name || task.name;
    task.description = description || task.description;
    task.assignedTo = assignedTo || task.assignedTo;
    task.eta = eta || task.eta;
    task.priority = priority || task.priority;
    task.column = column || task.column;

    await task.save();
    res.json({ message: 'Task updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a task
router.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findOneAndDelete({ id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;