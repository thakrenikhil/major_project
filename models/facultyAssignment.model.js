const mongoose = require('mongoose');

const facultyAssignmentSchema = new mongoose.Schema({
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required']
  },
  faculty_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Faculty ID is required']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FacultyAssignment', facultyAssignmentSchema);
