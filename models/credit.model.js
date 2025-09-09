const mongoose = require('mongoose');

const creditSchema = new mongoose.Schema({
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required']
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required']
  },
  credits_earned: {
    type: mongoose.Schema.Types.Decimal128,
    required: [true, 'Credits earned is required'],
    min: 0
  },
  awarded_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Awarded by is required']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Credit', creditSchema);
