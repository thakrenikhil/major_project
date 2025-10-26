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
    required: false
  },
  status: {
    type: String,
    enum: ['requested', 'verified', 'institution_signed', 'gsp_approved', 'issued'],
    default: 'requested'
  },
  requested_date: {
    type: Date,
    default: Date.now
  },
  verified_date: {
    type: Date
  },
  verified_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  institution_signed_date: {
    type: Date
  },
  institution_signature: {
    type: String
  },
  gsp_approved_date: {
    type: Date
  },
  gsp_approved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  gsp_signature: {
    type: String
  },
  download_count: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Generate unique hash before saving
certificateSchema.pre('save', function(next) {
  if (!this.unique_hash) {
    const hashInput = `${this.course_id}-${this.student_id}-${Date.now()}-${Math.random()}`;
    this.unique_hash = crypto.createHash('sha256').update(hashInput).digest('hex');
  }
  next();
});

module.exports = mongoose.model('Certificate', certificateSchema);
