// routes/machines.js
const express = require('express');
const Machine = require('../models/Machine');
const router = express.Router();

// Get machines by companyUid
router.get('/machines/:companyUid', async (req, res) => {
  const { companyUid } = req.params;

  try {
    const machines = await Machine.find({ companyUid });
    res.json(machines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new machine
router.post('/machines', async (req, res) => {
  const { name, usageTime, serviceTime, maintenanceTime, companyUid } = req.body;

  try {
    const newMachine = new Machine({
      name,
      usageTime: parseFloat(usageTime),
      serviceTime: parseFloat(serviceTime),
      maintenanceTime: parseFloat(maintenanceTime),
      companyUid,
    });

    await newMachine.save();
    res.status(201).json({ message: 'Machine added successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update an existing machine
router.put('/machines/:id', async (req, res) => {
  const { id } = req.params;
  const { name, usageTime, serviceTime, maintenanceTime } = req.body;

  try {
    const machine = await Machine.findById(id);
    if (!machine) return res.status(404).json({ message: 'Machine not found' });

    machine.name = name;
    machine.usageTime = parseFloat(usageTime);
    machine.serviceTime = parseFloat(serviceTime);
    machine.maintenanceTime = parseFloat(maintenanceTime);

    await machine.save();
    res.json({ message: 'Machine updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a machine
router.delete('/machines/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const machine = await Machine.findByIdAndDelete(id);
    if (!machine) return res.status(404).json({ message: 'Machine not found' });

    res.json({ message: 'Machine deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;