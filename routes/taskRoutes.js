const express = require('express');
const Task = require('../models/Task');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Create a Task
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { description, dueDate, assignedTo } = req.body;

    const task = new Task({
      description,
      dueDate,
      assignedBy: req.user._id,
      assignedTo,
      status: 'pending'
    });

    await task.save();

    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: 'Error creating task', error: error.message });
  }
});

// Get Tasks Assigned to User
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    
    const filter = { 
      assignedTo: req.user._id 
    };

    if (status) {
      filter.status = status;
    }

    const tasks = await Task.find(filter)
      .populate('assignedBy', 'name email')
      .populate('assignedTo', 'name email');

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
});

// Update Task Status
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    const task = await Task.findOneAndUpdate(
      { 
        _id: req.params.id, 
        assignedTo: req.user._id 
      },
      { status },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(400).json({ message: 'Error updating task', error: error.message });
  }
});

module.exports = router;