const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
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
  institution_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: [true, 'Institution ID is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  content_quality: {
    type: Number,
    required: [true, 'Content quality rating is required'],
    min: 1,
    max: 5
  },
  instructor_effectiveness: {
    type: Number,
    required: [true, 'Instructor effectiveness rating is required'],
    min: 1,
    max: 5
  },
  course_structure: {
    type: Number,
    required: [true, 'Course structure rating is required'],
    min: 1,
    max: 5
  },
  overall_satisfaction: {
    type: Number,
    required: [true, 'Overall satisfaction rating is required'],
    min: 1,
    max: 5
  },
  comments: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  suggestions: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  would_recommend: {
    type: Boolean,
    required: [true, 'Recommendation is required']
  },
  submission_date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure unique feedback per student per course
feedbackSchema.index({ student_id: 1, course_id: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
