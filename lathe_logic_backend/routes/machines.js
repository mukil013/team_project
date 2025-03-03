const express = require("express");
const Machine = require("../models/Machine");
const router = express.Router();

// Get machines by companyUid
router.get("/machines/:companyUid", async (req, res) => {
  const { companyUid } = req.params;
  try {
    const machines = await Machine.find({ companyUid });
    res.json(machines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new machine
router.post("/machines", async (req, res) => {
  try {
    console.log("Incoming request data:", req.body); // Log the request data
    const { name, usageTime, serviceDate, companyUid } = req.body;

    // Validate required fields
    if (!name || !usageTime || !companyUid) {
      return res.status(400).json({
        message: "Name, usageTime, and companyUid are required fields",
      });
    }

    // Validate usageTime array
    if (!Array.isArray(usageTime) || usageTime.length === 0) {
      return res.status(400).json({
        message: "Usage time must be a non-empty array",
      });
    }

    for (const entry of usageTime) {
      if (isNaN(entry.time)) {
        return res.status(400).json({
          message: "Invalid usage time: Must be a valid number",
        });
      }
    }

    const newMachine = new Machine({
      name,
      usageTime,
      serviceDate: serviceDate || [],
      companyUid,
    });

    await newMachine.save();
    res.status(201).json({
      message: "Machine added successfully",
      machine: newMachine,
    });
  } catch (error) {
    console.error("Error saving machine:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update a machine
router.put("/machines/:id", async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);
    if (!machine) return res.status(404).json({ message: "Machine not found" });

    // Update fields
    if (req.body.name) machine.name = req.body.name;

    machine.usageTime = req.body.usageTime;

    machine.serviceDate = req.body.serviceDate;

    await machine.save();
    res.json({
      message: "Machine updated successfully",
      machine,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a machine
router.delete("/machines/:id", async (req, res) => {
  try {
    const machine = await Machine.findByIdAndDelete(req.params.id);
    if (!machine) return res.status(404).json({ message: "Machine not found" });
    res.json({ message: "Machine deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
