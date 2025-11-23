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
	default:"default",
    required: [true, 'Assignment description is required'],
    trim: true
  },
  due_date: {
    type: Date,
	default:Date.now, 
    required: [true, 'Due date is required']
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
