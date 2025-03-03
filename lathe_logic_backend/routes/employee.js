// routes/employees.js
const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Get employees by companyUid
router.get('/employees/:companyUid', async (req, res) => {
  const { companyUid } = req.params;

  try {
    const employees = await User.find({ companyUid });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } 
});

// Update an employee
router.put('/employees/:id', async (req, res) => {
  const { id } = req.params;
  const { username, email, password, role } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.username = username;
    user.email = email;
    user.password = password;
    user.role = role;
    user.isAdmin = role === 'admin';

    await user.save();
    res.json({ message: 'Employee updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete an employee
router.delete('/employees/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;