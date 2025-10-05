const express = require('express');
const { 
  login, 
  createUser, 
  getProfile, 
  getUsers,
  createProgram,
  createCourse,
  enrollStudent,
  getPrograms,
  getCourses,
  markAttendance,
  getProgress,
  generateCertificate
} = require('../controllers/auth.controller');
const { auth, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Public routes
router.post('/login', login);

// Protected routes
router.get('/profile', auth, getProfile);
router.post('/create-user', auth, authorize('nodal_officer', 'admin'), createUser);
router.get('/users', auth, authorize('nodal_officer', 'admin'), getUsers);

// Program routes
router.post('/programs', auth, authorize('nodal_officer', 'admin'), createProgram);
router.get('/programs', auth, getPrograms);

// Course routes
router.post('/courses', auth, authorize('nodal_officer', 'admin'), createCourse);
router.get('/courses', auth, getCourses);

// Enrollment routes
router.post('/enroll', auth, authorize('nodal_officer', 'admin'), enrollStudent);

// Attendance routes
router.post('/attendance', auth, authorize('nodal_officer', 'admin', 'faculty'), markAttendance);

// Progress routes
router.get('/progress', auth, getProgress);

// Certificate routes
router.post('/certificates', auth, authorize('nodal_officer', 'admin'), generateCertificate);

module.exports = router;