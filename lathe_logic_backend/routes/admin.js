// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid'); // Import UUID library
const router = express.Router();

// Super Admin adds a new admin
router.post('/super-admin/add-admin', async (req, res) => {
  const { username, email, password, company, role } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const newAdmin = new User({
      id: uuidv4(),
      username,
      email,
      password,
      companyUid: uuidv4(),
      company,
      role,
      isAdmin: true,
    });

    await newAdmin.save();
    res.status(201).json({ message: 'Admin added successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new user
router.post('/add-user', async (req, res) => {
  const { username, email, password, companyUid, company, role } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const newUser = new User({
      id: uuidv4(),
      username,
      email,
      password,
      companyUid,
      company,
      role,
      isAdmin: false,
    });

    await newUser.save();
    res.status(201).json({ message: 'Employee added successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;