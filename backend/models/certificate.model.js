const mongoose = require('mongoose');
const crypto = require('crypto');

const certificateSchema = new mongoose.Schema({
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
  issued_date: {
    type: Date,
    required: [true, 'Issued date is required']
  },
  certificate_url: {
    type: String,
    required: [true, 'Certificate URL is required']
  },
  unique_hash: {
    type: String,
    unique: true,
    required: [true, 'Unique hash is required']
  }
}, {
  timestamps: true
});

// Generate unique hash before saving
certificateSchema.pre('save', function(next) {
  if (!this.unique_hash) {
    const hashInput = `${this.course_id}-${this.student_id}-${Date.now()}`;
    this.unique_hash = crypto.createHash('sha256').update(hashInput).digest('hex');
  }
  next();
});

module.exports = mongoose.model('Certificate', certificateSchema);
