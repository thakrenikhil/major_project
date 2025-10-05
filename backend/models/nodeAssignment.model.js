const mongoose = require('mongoose');

const nodeAssignmentSchema = new mongoose.Schema({
  node_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Node',
    required: [true, 'Node ID is required']
  },
  admin_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Admin ID is required']
  },
  assigned_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Assigned by is required']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('NodeAssignment', nodeAssignmentSchema);
