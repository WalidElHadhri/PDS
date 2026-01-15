const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { checkProjectOwner } = require('../middleware/projectAccess');

const router = express.Router();

// @route   POST /api/projects/:id/collaborators
// @desc    Invite a collaborator to a project
// @access  Private (owner only)
router.post('/:id/collaborators', [
  auth,
  checkProjectOwner,
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already a collaborator or owner
    const isOwner = req.project.owner.toString() === user._id.toString();
    const isCollaborator = req.project.collaborators.some(
      collab => collab.user.toString() === user._id.toString()
    );

    if (isOwner || isCollaborator) {
      return res.status(400).json({ 
        message: 'User is already a collaborator or owner of this project' 
      });
    }

    // Add collaborator
    req.project.collaborators.push({
      user: user._id,
      role: 'Collaborator'
    });

    await req.project.save();
    await req.project.populate('owner', 'username email');
    await req.project.populate('collaborators.user', 'username email');

    res.status(201).json({
      message: 'Collaborator added successfully',
      project: req.project
    });
  } catch (error) {
    console.error('Add collaborator error:', error);
    res.status(500).json({ message: 'Server error adding collaborator' });
  }
});

// @route   DELETE /api/projects/:id/collaborators/:userId
// @desc    Remove a collaborator from a project
// @access  Private (owner only)
router.delete('/:id/collaborators/:userId', auth, checkProjectOwner, async (req, res) => {
  try {
    const { userId } = req.params;

    // Cannot remove owner
    if (req.project.owner.toString() === userId) {
      return res.status(400).json({ message: 'Cannot remove project owner' });
    }

    // Remove collaborator
    req.project.collaborators = req.project.collaborators.filter(
      collab => collab.user.toString() !== userId
    );

    await req.project.save();
    await req.project.populate('owner', 'username email');
    await req.project.populate('collaborators.user', 'username email');

    res.json({
      message: 'Collaborator removed successfully',
      project: req.project
    });
  } catch (error) {
    console.error('Remove collaborator error:', error);
    res.status(500).json({ message: 'Server error removing collaborator' });
  }
});

module.exports = router;
