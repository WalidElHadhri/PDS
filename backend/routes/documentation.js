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

module.exports = router;
