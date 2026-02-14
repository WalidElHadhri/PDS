const mongoose = require('mongoose');

const collaboratorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['Owner', 'Collaborator'],
    default: 'Collaborator'
  }
}, { _id: false });

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [collaboratorSchema],
  documentation: {
    type: String,
    default: '',
    maxlength: [10000, 'Documentation cannot exceed 10000 characters']
  },
  currentVersion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Version',
    default: null
  },
  codeFile: {
    filename: {
      type: String,
      trim: true,
      maxlength: [100, 'Code file name cannot exceed 100 characters'],
      default: 'Main.java'
    },
    content: {
      type: String,
      default: '',
      maxlength: [20000, 'Code file content cannot exceed 20000 characters']
    },
    updatedAt: {
      type: Date
    }
  }
}, {
  timestamps: true
});

// Index for faster queries
projectSchema.index({ owner: 1 });
projectSchema.index({ 'collaborators.user': 1 });

module.exports = mongoose.model('Project', projectSchema);
