const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required']
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required']
  }
}, {
  timestamps: true
});

// Ensure unique enrollment per student per course
enrollmentSchema.index({ course_id: 1, student_id: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
