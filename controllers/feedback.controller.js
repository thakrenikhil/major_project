const Feedback = require('../models/feedback.model');
const User = require('../models/user.model');
const Course = require('../models/course.model');
const Institution = require('../models/institution.model');
const Enrollment = require('../models/enrollment.model');

// Submit Feedback (Student)
const submitFeedback = async (req, res) => {
  try {
    const {
      course_id,
      rating,
      content_quality,
      instructor_effectiveness,
      course_structure,
      overall_satisfaction,
      comments,
      suggestions,
      would_recommend
    } = req.body;

    const student = req.user;

    if (student.role !== 'student') {
      return res.status(403).json({ error: 'Only students can submit feedback' });
    }

    // Validate required fields
    if (!course_id || !rating || !content_quality || !instructor_effectiveness ||
        !course_structure || !overall_satisfaction || would_recommend === undefined) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // Check if student is enrolled in the course
    const enrollment = await Enrollment.findOne({
      course_id,
      student_id: student._id
    });

    if (!enrollment) {
      return res.status(400).json({ error: 'Student is not enrolled in this course' });
    }

    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({
      student_id: student._id,
      course_id
    });

    if (existingFeedback) {
      return res.status(400).json({ error: 'Feedback already submitted for this course' });
    }

    // Get institution from course
    const course = await Course.findById(course_id).populate('institution_id');
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const feedback = new Feedback({
      student_id: student._id,
      course_id,
      institution_id: course.institution_id._id,
      rating,
      content_quality,
      instructor_effectiveness,
      course_structure,
      overall_satisfaction,
      comments,
      suggestions,
      would_recommend
    });

    await feedback.save();

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Feedback (Nodal Officer, Admin, GSP Authority)
const getFeedback = async (req, res) => {
  try {
    const user = req.user;
    const { course_id, institution_id } = req.query;

    let query = {};

    if (course_id) {
      query.course_id = course_id;
    }

    if (institution_id) {
      query.institution_id = institution_id;
    }

    // Role-based filtering
    if (user.role === 'nodal_officer') {
      // Nodal officer can see feedback for courses in their node
      const courses = await Course.find({ 'institution_id.assigned_node_id': user.node_id });
      query.course_id = { $in: courses.map(c => c._id) };
    }

    const feedback = await Feedback.find(query)
      .populate('student_id', 'name email')
      .populate('course_id', 'course_name')
      .populate('institution_id', 'name')
      .sort({ submission_date: -1 });

    res.json({ feedback });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Feedback Statistics
const getFeedbackStats = async (req, res) => {
  try {
    const user = req.user;
    const { course_id, institution_id } = req.query;

    let matchQuery = {};

    if (course_id) {
      matchQuery.course_id = course_id;
    }

    if (institution_id) {
      matchQuery.institution_id = institution_id;
    }

    // Role-based filtering
    if (user.role === 'nodal_officer') {
      const courses = await Course.find({ 'institution_id.assigned_node_id': user.node_id });
      matchQuery.course_id = { $in: courses.map(c => c._id) };
    }

    const stats = await Feedback.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          total_feedback: { $sum: 1 },
          avg_rating: { $avg: '$rating' },
          avg_content_quality: { $avg: '$content_quality' },
          avg_instructor_effectiveness: { $avg: '$instructor_effectiveness' },
          avg_course_structure: { $avg: '$course_structure' },
          avg_overall_satisfaction: { $avg: '$overall_satisfaction' },
          recommendation_rate: {
            $avg: { $cond: ['$would_recommend', 1, 0] }
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
  submitFeedback,
  getFeedback,
  getFeedbackStats
};
