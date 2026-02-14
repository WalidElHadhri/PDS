const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  versionNumber: {
    type: String,
    required: [true, 'Version number is required'],
    trim: true,
    maxlength: [50, 'Version number cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Optional snapshot of the shared code file at the time this version was created.
  codeFile: {
    filename: {
      type: String,
      trim: true,
      maxlength: [100, 'Code file name cannot exceed 100 characters']
    },
    content: {
      type: String,
      maxlength: [20000, 'Code file content cannot exceed 20000 characters']
    }
  }
}, {
  timestamps: true
});

// Index for faster queries
versionSchema.index({ project: 1 });

module.exports = mongoose.model('Version', versionSchema);
