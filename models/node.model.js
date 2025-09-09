const mongoose = require('mongoose');

const nodeSchema = new mongoose.Schema({
  node_name: {
    type: String,
    required: [true, 'Node name is required'],
    trim: true
  },
  state_name: {
    type: String,
    required: [true, 'State name is required'],
    trim: true
  },
  node_coordinates: {
    type: String,
    trim: true
  },
  nodal_officer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Node', nodeSchema);