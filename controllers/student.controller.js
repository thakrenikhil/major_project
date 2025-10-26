const User = require('../models/user.model');
const Course = require('../models/course.model');
const Enrollment = require('../models/enrollment.model');
const Payment = require('../models/payment.model');
const Node = require('../models/node.model');

// Register Student (Nodal Officer/Admin)
const registerStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      parents_name,
      mobile,
      address,
      govt_id,
      govt_id_type,
      node_id
    } = req.body;

    const creator = req.user;

    if (!['nodal_officer', 'admin'].includes(creator.role)) {
      return res.status(403).json({ error: 'Only nodal officers and admins can register students' });
    }

    // Validate required fields
    if (!name || !email || !password || !parents_name || !mobile || !address || !govt_id || !govt_id_type) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Check if government ID already exists
    const existingGovtId = await User.findOne({ govt_id });
    if (existingGovtId) {
      return res.status(400).json({ error: 'Government ID already registered' });
    }

    // Use creator's node_id if not provided
    const userNodeId = node_id || creator.node_id;

    // Validate node exists
    const node = await Node.findById(userNodeId);
    if (!node) {
      return res.status(400).json({ error: 'Invalid node' });
    }

    const student = new User({
      node_id: userNodeId,
      name,
      email,
      password_hash: password, // Will be hashed by pre-save middleware
      role: 'student',
      parents_name,
      mobile,
      address,
      govt_id,
      govt_id_type,
      created_by: creator._id
    });

    await student.save();

    res.status(201).json({
      message: 'Student registered successfully',
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
        node: student.node_id
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Enroll Student in Course
const enrollStudent = async (req, res) => {
  try {
    const { course_id, student_id } = req.body;
    const enroller = req.user;

    if (!['nodal_officer', 'admin'].includes(enroller.role)) {
      return res.status(403).json({ error: 'Only nodal officers and admins can enroll students' });
    }

    if (!course_id || !student_id) {
      return res.status(400).json({ error: 'Course ID and Student ID are required' });
    }

    // Check if course exists and is approved
    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (course.status !== 'APPROVED' && course.status !== 'IN_PROGRESS') {
      return res.status(400).json({ error: 'Course is not available for enrollment' });
    }

    // Check if student exists
    const student = await User.findById(student_id);
    if (!student || student.role !== 'student') {
      return res.status(400).json({ error: 'Invalid student' });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({ course_id, student_id });
    if (existingEnrollment) {
      return res.status(400).json({ error: 'Student already enrolled in this course' });
    }

    // Create enrollment
    const enrollment = new Enrollment({
      course_id,
      student_id
    });

    await enrollment.save();

    // Handle payment for GSP courses
    if (course.is_gsp_course && course.course_fee > 0) {
      // Create payment record
      const payment = new Payment({
        student_id,
        course_id,
        amount: course.course_fee,
        payment_method: 'pending',
        transaction_id: `TXN_${Date.now()}_${student_id}`,
        status: 'pending'
      });

      await payment.save();

      // Update student payment status
      student.payment_status = 'pending';
      student.payment_amount = course.course_fee;
      await student.save();
    }

    res.status(201).json({
      message: 'Student enrolled successfully',
      enrollment,
      payment_required: course.is_gsp_course && course.course_fee > 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Bulk Enroll Students (Excel upload)
const bulkEnrollStudents = async (req, res) => {
  try {
    const { course_id, students_data } = req.body; // students_data: array of student objects
    const enroller = req.user;

    if (!['nodal_officer', 'admin'].includes(enroller.role)) {
      return res.status(403).json({ error: 'Only nodal officers and admins can bulk enroll students' });
    }

    if (!course_id || !students_data || !Array.isArray(students_data)) {
      return res.status(400).json({ error: 'Course ID and students data are required' });
    }

    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (course.status !== 'APPROVED' && course.status !== 'IN_PROGRESS') {
      return res.status(400).json({ error: 'Course is not available for enrollment' });
    }

    const results = {
      successful: [],
      failed: []
    };

    for (const studentData of students_data) {
      try {
        // Check if student exists
        let student = await User.findOne({ email: studentData.email });
        
        if (!student) {
          // Create new student
          student = new User({
            node_id: enroller.node_id,
            name: studentData.name,
            email: studentData.email,
            password_hash: studentData.password || 'defaultPassword123',
            role: 'student',
            parents_name: studentData.parents_name,
            mobile: studentData.mobile,
            address: studentData.address,
            govt_id: studentData.govt_id,
            govt_id_type: studentData.govt_id_type,
            created_by: enroller._id
          });
          await student.save();
        }

        // Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({ course_id, student_id: student._id });
        if (existingEnrollment) {
          results.failed.push({
            email: studentData.email,
            reason: 'Already enrolled'
          });
          continue;
        }

        // Create enrollment
        const enrollment = new Enrollment({
          course_id,
          student_id: student._id
        });
        await enrollment.save();

        results.successful.push({
          email: studentData.email,
          name: studentData.name
        });

      } catch (error) {
        results.failed.push({
          email: studentData.email,
          reason: error.message
        });
      }
    }

    res.json({
      message: 'Bulk enrollment completed',
      results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Students (with filters)
const getStudents = async (req, res) => {
  try {
    const user = req.user;
    const { course_id, node_id } = req.query;

    let query = { role: 'student' };

    if (node_id) {
      query.node_id = node_id;
    }

    // Role-based filtering
    if (user.role === 'nodal_officer' || user.role === 'admin') {
      query.node_id = user.node_id;
    }

    const students = await User.find(query)
      .populate('node_id', 'node_name state_name')
      .select('-password_hash')
      .sort({ createdAt: -1 });

    // If course_id is provided, also return enrollment status
    if (course_id) {
      const enrollments = await Enrollment.find({ course_id });
      const enrolledStudentIds = enrollments.map(e => e.student_id.toString());

      students.forEach(student => {
        student.isEnrolled = enrolledStudentIds.includes(student._id.toString());
      });
    }

    res.json({ students });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Student by ID
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const student = await User.findById(id)
      .populate('node_id', 'node_name state_name')
      .select('-password_hash');

    if (!student || student.role !== 'student') {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Check permissions
    if (user.role === 'nodal_officer' && !student.node_id.equals(user.node_id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ student });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerStudent,
  enrollStudent,
  bulkEnrollStudents,
  getStudents,
  getStudentById
};
