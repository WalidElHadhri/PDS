const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const { checkProjectAccess } = require('../middleware/projectAccess');

const router = express.Router();

// @route   GET /api/projects/:id/documentation
// @desc    Get project documentation
// @access  Private (owner or collaborator)
router.get('/:id/documentation', auth, checkProjectAccess, async (req, res) => {
  try {
    res.json({ 
      documentation: req.project.documentation || '' 
    });
  } catch (error) {
    console.error('Get documentation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/projects/:id/documentation
// @desc    Update project documentation
// @access  Private (owner or collaborator)
router.put('/:id/documentation', [
  auth,
  checkProjectAccess,
  body('documentation')
    .optional()
    .isLength({ max: 10000 })
    .withMessage('Documentation cannot exceed 10000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { documentation } = req.body;

    req.project.documentation = documentation || '';
    await req.project.save();

    res.json({
      message: 'Documentation updated successfully',
      documentation: req.project.documentation
    });
  } catch (error) {
    console.error('Update documentation error:', error);
    res.status(500).json({ message: 'Server error updating documentation' });
  }
});

// @route   GET /api/projects/:id/code-file
// @desc    Get shared code file for project (used by inline editor)
// @access  Private (owner or collaborator)
router.get('/:id/code-file', auth, checkProjectAccess, async (req, res) => {
  try {
    const codeFile = req.project.codeFile || {};
    res.json({
      filename: codeFile.filename || 'Main.java',
      content: codeFile.content || '',
      updatedAt: codeFile.updatedAt || null
    });
  } catch (error) {
    console.error('Get code file error:', error);
    res.status(500).json({ message: 'Server error getting code file' });
  }
});

// @route   PUT /api/projects/:id/code-file
// @desc    Update shared code file for project (used by inline editor)
// @access  Private (owner or collaborator)
router.put('/:id/code-file', [
  auth,
  checkProjectAccess,
  body('filename')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('File name cannot exceed 100 characters'),
  body('content')
    .optional()
    .isLength({ max: 20000 })
    .withMessage('Code file content cannot exceed 20000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { filename, content } = req.body;

    req.project.codeFile = {
      filename: filename || req.project.codeFile?.filename || 'Main.java',
      content: content || '',
      updatedAt: new Date()
    };

    await req.project.save();

    res.json({
      message: 'Code file saved successfully',
      codeFile: req.project.codeFile
    });
  } catch (error) {
    console.error('Update code file error:', error);
    res.status(500).json({ message: 'Server error updating code file' });
  }
});

module.exports = router;
