const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
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
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: 0
  },
  currency: {
    type: String,
    default: 'INR',
    trim: true
  },
  payment_method: {
    type: String,
    enum: ['UPI', 'Net Banking', 'Credit Card', 'Debit Card', 'Wallet', 'Cash'],
    required: [true, 'Payment method is required']
  },
  transaction_id: {
    type: String,
    required: [true, 'Transaction ID is required'],
    unique: true,
    trim: true
  },
  payment_gateway: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  payment_date: {
    type: Date,
    default: Date.now
  },
  refund_date: {
    type: Date
  },
  refund_amount: {
    type: Number,
    default: 0,
    min: 0
  },
  refund_reason: {
    type: String,
    trim: true
  },
  receipt_url: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Ensure unique payment per student per course
paymentSchema.index({ student_id: 1, course_id: 1 }, { unique: true });

module.exports = mongoose.model('Payment', paymentSchema);
