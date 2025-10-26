const express = require('express');
const {
  submitFeedback,
  getFeedback,
  getFeedbackStats
} = require('../controllers/feedback.controller');
const { auth, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Protected routes
router.post('/submit', auth, authorize('student'), submitFeedback);
router.get('/', auth, authorize('nodal_officer', 'admin', 'gsp_authority'), getFeedback);
router.get('/stats', auth, authorize('nodal_officer', 'admin', 'gsp_authority'), getFeedbackStats);

module.exports = router;
