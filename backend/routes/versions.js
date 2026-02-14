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

    res.json({ versions, currentVersion: req.project.currentVersion || null });
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

    // Snapshot the current shared code file (if any) at the time this version is created.
    const codeFileSnapshot = req.project.codeFile
      ? {
          filename: req.project.codeFile.filename,
          content: req.project.codeFile.content
        }
      : undefined;

    const version = new Version({
      project: req.params.id,
      versionNumber,
      description: description || '',
      createdBy: req.user._id,
      ...(codeFileSnapshot && { codeFile: codeFileSnapshot })
    });

    await version.save();
    await version.populate('createdBy', 'username email');

    // Optionally, you could automatically set the newest version as current.
    // For now we just return the created version and let the user choose which is current.

    res.status(201).json({
      message: 'Version created successfully',
      version
    });
  } catch (error) {
    console.error('Create version error:', error);
    res.status(500).json({ message: 'Server error creating version' });
  }
});

// @route   PUT /api/projects/:id/versions/:versionId/current
// @desc    Set the current (active) version metadata for the project
// @access  Private (owner or collaborator)
router.put('/:id/versions/:versionId/current', auth, checkProjectAccess, async (req, res) => {
  try {
    const { id, versionId } = req.params;

    // Ensure the version belongs to this project
    const version = await Version.findOne({ _id: versionId, project: id });
    if (!version) {
      return res.status(404).json({ message: 'Version not found for this project' });
    }

    // Update the project's currentVersion pointer
    req.project.currentVersion = version._id;

    // If this version captured a code file snapshot, restore it as the current shared code file.
    if (version.codeFile && (version.codeFile.filename || version.codeFile.content)) {
      req.project.codeFile = {
        filename: version.codeFile.filename || req.project.codeFile?.filename || 'Main.java',
        content: version.codeFile.content || '',
        updatedAt: new Date()
      };
    }

    await req.project.save();

    res.json({
      message: 'Current version updated successfully',
      currentVersion: req.project.currentVersion
    });
  } catch (error) {
    console.error('Set current version error:', error);
    res.status(500).json({ message: 'Server error updating current version' });
  }
});

module.exports = router;
