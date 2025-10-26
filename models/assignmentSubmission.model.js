const mongoose = require('mongoose');

const assignmentSubmissionSchema = new mongoose.Schema({
  assignment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: [true, 'Assignment ID is required']
  },
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
  submission_text: {
    type: String,
    trim: true
  },
  submission_files: [{
    filename: String,
    original_name: String,
    file_path: String,
    file_size: Number,
    mime_type: String,
    uploaded_at: {
      type: Date,
      default: Date.now
    }
  }],
  submission_date: {
    type: Date,
    default: Date.now
  },
  is_late: {
    type: Boolean,
    default: false
  },
  late_days: {
    type: Number,
    default: 0,
    min: 0
  },
  marks_obtained: {
    type: Number,
    min: 0
  },
  feedback: {
    type: String,
    trim: true
  },
  graded_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  graded_date: {
    type: Date
  },
  status: {
    type: String,
    enum: ['submitted', 'graded', 'returned'],
    default: 'submitted'
  }
}, {
  timestamps: true
});

// Ensure unique submission per student per assignment
assignmentSubmissionSchema.index({ assignment_id: 1, student_id: 1 }, { unique: true });

module.exports = mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);
