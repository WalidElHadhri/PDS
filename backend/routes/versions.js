const express = require('express');
const { body, validationResult } = require('express-validator');
const Version = require('../models/Version');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const { checkProjectAccess } = require('../middleware/projectAccess');

const router = express.Router();

// @route   GET /api/projects/:id/versions
// @desc    Get all versions for a project
// @access  Private (owner or collaborator)
router.get('/:id/versions', auth, checkProjectAccess, async (req, res) => {
  try {
    const versions = await Version.find({ project: req.params.id })
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 });

    res.json({ versions });
  } catch (error) {
    console.error('Get versions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/projects/:id/versions
// @desc    Create a new version for a project
// @access  Private (owner or collaborator)
router.post('/:id/versions', [
  auth,
  checkProjectAccess,
  body('versionNumber')
    .trim()
    .notEmpty()
    .withMessage('Version number is required')
    .isLength({ max: 50 })
    .withMessage('Version number cannot exceed 50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { versionNumber, description } = req.body;

    const version = new Version({
      project: req.params.id,
      versionNumber,
      description: description || '',
      createdBy: req.user._id
    });

    await version.save();
    await version.populate('createdBy', 'username email');

    res.status(201).json({
      message: 'Version created successfully',
      version
    });
  } catch (error) {
    console.error('Create version error:', error);
    res.status(500).json({ message: 'Server error creating version' });
  }
});

module.exports = router;
