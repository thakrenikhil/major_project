const express = require('express');
const {
  createCourse,
  approveCourse,
  startCourse,
  completeCourse,
  getCourses,
  getCourseById
} = require('../controllers/course.controller');
const { auth, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Protected routes
router.post('/create', auth, authorize('admin'), createCourse);
router.post('/approve', auth, authorize('nodal_officer'), approveCourse);
router.post('/start', auth, authorize('nodal_officer'), startCourse);
router.post('/complete', auth, authorize('nodal_officer'), completeCourse);
router.get('/', auth, getCourses);
router.get('/:id', auth, getCourseById);

module.exports = router;
