const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required']
  },
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required']
  },
  attendance_pct: {
    type: mongoose.Schema.Types.Decimal128,
    required: [true, 'Attendance percentage is required'],
    min: 0,
    max: 100
  },
  credits_earned: {
    type: mongoose.Schema.Types.Decimal128,
    required: [true, 'Credits earned is required'],
    min: 0
  }
}, {
  timestamps: true
});

// Ensure unique progress record per student per course
progressSchema.index({ student_id: 1, course_id: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
