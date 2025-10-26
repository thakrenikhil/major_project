const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  institution_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: [true, 'Institution ID is required']
  },
  course_name: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  duration: {
    type: Number,
    required: [true, 'Duration in days is required'],
    min: 1
  },
  start_date: {
    type: Date,
    required: [true, 'Start date is required']
  },
  end_date: {
    type: Date,
    required: [true, 'End date is required']
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
  course_timing: {
    type: String,
    required: [true, 'Course timing is required'],
    trim: true
  },
  course_fee: {
    type: Number,
    default: 0,
    min: 0
  },
  is_gsp_course: {
    type: Boolean,
    default: false
  },
  nodal_officer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Nodal officer is required']
  },
  industry_partner_name: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['CREATED', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'CREATED'
  },
  approval_date: {
    type: Date
  },
  approved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  completion_date: {
    type: Date
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by is required']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);
