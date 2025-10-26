const Payment = require('../models/payment.model');
const Course = require('../models/course.model');
const User = require('../models/user.model');
const Enrollment = require('../models/enrollment.model');

// Process Payment (Student)
const processPayment = async (req, res) => {
  try {
    const {
      course_id,
      payment_method,
      payment_gateway,
      transaction_id
    } = req.body;

    const student = req.user;

    if (student.role !== 'student') {
      return res.status(403).json({ error: 'Only students can make payments' });
    }

    if (!course_id || !payment_method || !transaction_id) {
      return res.status(400).json({ error: 'Course ID, payment method, and transaction ID are required' });
    }

    // Check if student is enrolled
    const enrollment = await Enrollment.findOne({ course_id, student_id: student._id });
    if (!enrollment) {
      return res.status(400).json({ error: 'Student is not enrolled in this course' });
    }

    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (!course.is_gsp_course || course.course_fee <= 0) {
      return res.status(400).json({ error: 'Payment not required for this course' });
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ course_id, student_id: student._id });
    if (existingPayment) {
      return res.status(400).json({ error: 'Payment already processed for this course' });
    }

    const payment = new Payment({
      student_id: student._id,
      course_id,
      amount: course.course_fee,
      payment_method,
      transaction_id,
      payment_gateway,
      status: 'success'
    });

    await payment.save();

    // Update student payment status
    student.payment_status = 'paid';
    student.payment_amount = course.course_fee;
    student.payment_date = new Date();
    await student.save();

    res.status(201).json({
      message: 'Payment processed successfully',
      payment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Payments (with role-based filtering)
const getPayments = async (req, res) => {
  try {
    const user = req.user;
    const { course_id, student_id, status } = req.query;

    let query = {};

    if (course_id) {
      query.course_id = course_id;
    }

    if (student_id) {
      query.student_id = student_id;
    }

    if (status) {
      query.status = status;
    }

    // Role-based filtering
    if (user.role === 'student') {
      query.student_id = user._id;
    } else if (user.role === 'nodal_officer') {
      // Nodal officer can see payments for courses in their node
      const courses = await Course.find({ nodal_officer: user._id });
      query.course_id = { $in: courses.map(c => c._id) };
    }

    const payments = await Payment.find(query)
      .populate('student_id', 'name email')
      .populate('course_id', 'course_name title')
      .sort({ payment_date: -1 });

    res.json({ payments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Refund Payment (Admin/GSP Authority)
const refundPayment = async (req, res) => {
  try {
    const { payment_id, refund_reason } = req.body;
    const refunder = req.user;

    if (!['admin', 'gsp_authority'].includes(refunder.role)) {
      return res.status(403).json({ error: 'Only admins and GSP Authority can process refunds' });
    }

    if (!payment_id || !refund_reason) {
      return res.status(400).json({ error: 'Payment ID and refund reason are required' });
    }

    const payment = await Payment.findById(payment_id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.status !== 'success') {
      return res.status(400).json({ error: 'Payment must be successful to refund' });
    }

    payment.status = 'refunded';
    payment.refund_date = new Date();
    payment.refund_amount = payment.amount;
    payment.refund_reason = refund_reason;

    await payment.save();

    // Update student payment status
    const student = await User.findById(payment.student_id);
    if (student) {
      student.payment_status = 'refunded';
      await student.save();
    }

    res.json({
      message: 'Payment refunded successfully',
      payment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Payment Statistics
const getPaymentStats = async (req, res) => {
  try {
    const user = req.user;
    const { course_id } = req.query;

    let matchQuery = {};

    if (course_id) {
      matchQuery.course_id = course_id;
    }

    // Role-based filtering
    if (user.role === 'nodal_officer') {
      const courses = await Course.find({ nodal_officer: user._id });
      matchQuery.course_id = { $in: courses.map(c => c._id) };
    }

    const stats = await Payment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          total_payments: { $sum: 1 },
          total_amount: { $sum: '$amount' },
          successful_payments: {
            $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
          },
          successful_amount: {
            $sum: { $cond: [{ $eq: ['$status', 'success'] }, '$amount', 0] }
          },
          refunded_payments: {
            $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, 1, 0] }
          },
          refunded_amount: {
            $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, '$amount', 0] }
          }
        }
      }
    ]);

    res.json({ stats: stats[0] || {} });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  processPayment,
  getPayments,
  refundPayment,
  getPaymentStats
};
