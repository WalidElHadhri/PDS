const Project = require('../models/Project');

const checkProjectAccess = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is owner or collaborator
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isCollaborator = project.collaborators.some(
      collab => collab.user.toString() === req.user._id.toString()
    );

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ message: 'Access denied to this project' });
    }

    req.project = project;
    req.isOwner = isOwner;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error checking project access', error: error.message });
  }
};

const checkProjectOwner = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only project owner can perform this action' });
    }

    req.project = project;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error checking project ownership', error: error.message });
  }
};

module.exports = { checkProjectAccess, checkProjectOwner };
