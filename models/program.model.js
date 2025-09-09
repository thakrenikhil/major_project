const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  node_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Node',
    required: [true, 'Node ID is required']
  },
  program_name: {
    type: String,
    required: [true, 'Program name is required'],
    trim: true
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by is required']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Program', programSchema);
