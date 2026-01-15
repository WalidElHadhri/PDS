const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const { checkProjectAccess, checkProjectOwner } = require('../middleware/projectAccess');

const router = express.Router();

// @route   GET /api/projects
// @desc    Get all projects for current user (owned and shared)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { 'collaborators.user': req.user._id }
      ]
    })
    .populate('owner', 'username email')
    .populate('collaborators.user', 'username email')
    .sort({ updatedAt: -1 });

    res.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private
router.post('/', [
  auth,
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ max: 100 })
    .withMessage('Project name cannot exceed 100 characters'),
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

    const { name, description } = req.body;

    const project = new Project({
      name,
      description: description || '',
      owner: req.user._id,
      collaborators: [{
        user: req.user._id,
        role: 'Owner'
      }]
    });

    await project.save();
    await project.populate('owner', 'username email');
    await project.populate('collaborators.user', 'username email');

    res.status(201).json({ 
      message: 'Project created successfully',
      project 
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error creating project' });
  }
});

// @route   GET /api/projects/:id
// @desc    Get project details
// @access  Private (owner or collaborator)
router.get('/:id', auth, checkProjectAccess, async (req, res) => {
  try {
    await req.project.populate('owner', 'username email');
    await req.project.populate('collaborators.user', 'username email');
    res.json({ project: req.project });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project metadata
// @access  Private (owner or collaborator)
router.put('/:id', [
  auth,
  checkProjectAccess,
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Project name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Project name cannot exceed 100 characters'),
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

    const { name, description } = req.body;

    if (name) req.project.name = name;
    if (description !== undefined) req.project.description = description;

    await req.project.save();
    await req.project.populate('owner', 'username email');
    await req.project.populate('collaborators.user', 'username email');

    res.json({ 
      message: 'Project updated successfully',
      project: req.project 
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error updating project' });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project (owner only)
// @access  Private (owner only)
router.delete('/:id', auth, checkProjectOwner, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error deleting project' });
  }
});

module.exports = router;
