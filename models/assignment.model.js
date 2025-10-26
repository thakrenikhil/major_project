const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required']
  },
  title: {
    type: String,
    required: [true, 'Assignment title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Assignment description is required'],
    trim: true
  },
  instructions: {
    type: String,
    trim: true
  },
  due_date: {
    type: Date,
    required: [true, 'Due date is required']
  },
  max_marks: {
    type: Number,
    required: [true, 'Maximum marks is required'],
    min: 0
  },
  weightage: {
    type: Number,
    required: [true, 'Weightage is required'],
    min: 0,
    max: 100
  },
  assignment_type: {
    type: String,
    enum: ['individual', 'group', 'project', 'quiz', 'exam'],
    default: 'individual'
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'closed'],
    default: 'draft'
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by is required']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Assignment', assignmentSchema);
