const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Institution name is required'],
    trim: true
  },
  course_name: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true
  },
  coordinator_name: {
    type: String,
    required: [true, 'Coordinator name is required'],
    trim: true
  },
  coordinator_email: {
    type: String,
    required: [true, 'Coordinator email is required'],
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  coordinator_phone: {
    type: String,
    required: [true, 'Coordinator phone is required'],
    trim: true
  },
  trainer_name: {
    type: String,
    required: [true, 'Trainer name is required'],
    trim: true
  },
  trainer_email: {
    type: String,
    required: [true, 'Trainer email is required'],
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  trainer_phone: {
    type: String,
    required: [true, 'Trainer phone is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  pincode: {
    type: String,
    required: [true, 'Pincode is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'active', 'suspended'],
    default: 'pending'
  },
  assigned_node_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Node'
  },
  assigned_nodal_officer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  registration_date: {
    type: Date,
    default: Date.now
  },
  verification_date: {
    type: Date
  },
  verified_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Institution', institutionSchema);
