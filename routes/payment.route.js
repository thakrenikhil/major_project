const express = require('express');
const {
  processPayment,
  getPayments,
  refundPayment,
  getPaymentStats
} = require('../controllers/payment.controller');
const { auth, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Protected routes
router.post('/process', auth, authorize('student'), processPayment);
router.get('/', auth, getPayments);
router.get('/stats', auth, authorize('nodal_officer', 'admin', 'gsp_authority'), getPaymentStats);
router.post('/refund', auth, authorize('admin', 'gsp_authority'), refundPayment);

module.exports = router;
