const User = require('../models/user.model');
const Node = require('../models/node.model');
const Program = require('../models/program.model');
const Course = require('../models/course.model');
const NodeAssignment = require('../models/nodeAssignment.model');
const FacultyAssignment = require('../models/facultyAssignment.model');
const Enrollment = require('../models/enrollment.model');
const Attendance = require('../models/attendance.model');
const Credit = require('../models/credit.model');
const Certificate = require('../models/certificate.model');
const Progress = require('../models/progress.model');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email }).populate('node_id');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        node: user.node_id
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create user (only for nodal officers and admins)
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, node_id } = req.body;
    const creator = req.user;

    // Validate input
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Role hierarchy validation
    if (creator.role === 'nodal_officer') {
      // Nodal officer can create admins, faculty, students
      if (!['admin', 'faculty', 'student'].includes(role)) {
        return res.status(403).json({ error: 'Nodal officer can only create admin, faculty, or student accounts' });
      }
    } else if (creator.role === 'admin') {
      // Admin can create faculty and students
      if (!['faculty', 'student'].includes(role)) {
        return res.status(403).json({ error: 'Admin can only create faculty or student accounts' });
      }
    } else {
      return res.status(403).json({ error: 'Insufficient permissions to create users' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Use creator's node_id if not provided
    const userNodeId = node_id || creator.node_id._id;

    // Validate node exists
    const node = await Node.findById(userNodeId);
    if (!node) {
      return res.status(400).json({ error: 'Invalid node ID' });
    }

    // Create user
    const user = new User({
      name,
      email,
      password_hash: password, // Will be hashed by pre-save middleware
      role,
      node_id: userNodeId,
      created_by: creator._id
    });

    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        node_id: user.node_id
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('node_id')
      .populate('created_by', 'name email role');

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        node: user.node_id,
        created_by: user.created_by,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get users under current user's hierarchy
const getUsers = async (req, res) => {
  try {
    const currentUser = req.user;
    let query = {};

    // Filter based on role hierarchy
    if (currentUser.role === 'nodal_officer') {
      // Can see all users in their node
      query = { node_id: currentUser.node_id._id };
    } else if (currentUser.role === 'admin') {
      // Can see faculty and students they created or in their node
      query = {
        node_id: currentUser.node_id._id,
        role: { $in: ['faculty', 'student'] }
      };
    } else {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const users = await User.find(query)
      .populate('node_id', 'node_name state_name')
      .populate('created_by', 'name role')
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create Program (nodal officers and admins)
const createProgram = async (req, res) => {
  try {
    const { program_name } = req.body;
    const creator = req.user;

    if (!program_name) {
      return res.status(400).json({ error: 'Program name is required' });
    }

    if (!['nodal_officer', 'admin'].includes(creator.role)) {
      return res.status(403).json({ error: 'Insufficient permissions to create programs' });
    }

    const program = new Program({
      node_id: creator.node_id._id,
      program_name,
      created_by: creator._id
    });

    await program.save();

    res.status(201).json({
      message: 'Program created successfully',
      program: {
        id: program._id,
        program_name: program.program_name,
        node_id: program.node_id
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create Course (nodal officers and admins)
const createCourse = async (req, res) => {
  try {
    const { program_id, course_name, description, start_date, end_date } = req.body;
    const creator = req.user;

    if (!program_id || !course_name || !start_date || !end_date) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    if (!['nodal_officer', 'admin'].includes(creator.role)) {
      return res.status(403).json({ error: 'Insufficient permissions to create courses' });
    }

    // Verify program exists and belongs to same node
    const program = await Program.findById(program_id);
    if (!program || !program.node_id.equals(creator.node_id._id)) {
      return res.status(400).json({ error: 'Invalid program or program not in your node' });
    }

    const course = new Course({
      program_id,
      course_name,
      description,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      created_by: creator._id
    });

    await course.save();

    res.status(201).json({
      message: 'Course created successfully',
      course: {
        id: course._id,
        course_name: course.course_name,
        program_id: course.program_id,
        start_date: course.start_date,
        end_date: course.end_date,
        status: course.status
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

    if (!course_id || !student_id) {
      return res.status(400).json({ error: 'Course ID and Student ID are required' });
    }

    if (!['nodal_officer', 'admin'].includes(enroller.role)) {
      return res.status(403).json({ error: 'Insufficient permissions to enroll students' });
    }

    // Verify course exists and belongs to same node
    const course = await Course.findById(course_id).populate('program_id');
    if (!course || !course.program_id.node_id.equals(enroller.node_id._id)) {
      return res.status(400).json({ error: 'Invalid course or course not in your node' });
    }

    // Verify student exists and belongs to same node
    const student = await User.findById(student_id);
    if (!student || !student.node_id.equals(enroller.node_id._id) || student.role !== 'student') {
      return res.status(400).json({ error: 'Invalid student or student not in your node' });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({ course_id, student_id });
    if (existingEnrollment) {
      return res.status(400).json({ error: 'Student is already enrolled in this course' });
    }

    const enrollment = new Enrollment({
      course_id,
      student_id
    });

    await enrollment.save();

    res.status(201).json({
      message: 'Student enrolled successfully',
      enrollment: {
        id: enrollment._id,
        course_id: enrollment.course_id,
        student_id: enrollment.student_id
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Programs
const getPrograms = async (req, res) => {
  try {
    const currentUser = req.user;
    let query = { node_id: currentUser.node_id._id };

    const programs = await Program.find(query)
      .populate('created_by', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ programs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Courses
const getCourses = async (req, res) => {
  try {
    const currentUser = req.user;
    const { program_id } = req.query;

    let query = {};
    if (program_id) {
      query.program_id = program_id;
    }

    const courses = await Course.find(query)
      .populate('program_id', 'program_name node_id')
      .populate('created_by', 'name email role')
      .sort({ createdAt: -1 });

    // Filter courses that belong to user's node
    const filteredCourses = courses.filter(course => 
      course.program_id.node_id.equals(currentUser.node_id._id)
    );

    res.json({ courses: filteredCourses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark Attendance (faculty, admin, nodal_officer)
const markAttendance = async (req, res) => {
  try {
    const { course_id, student_id, date, status } = req.body;
    const marker = req.user;

    if (!course_id || !student_id || !date || !status) {
      return res.status(400).json({ error: 'course_id, student_id, date, status are required' });
    }

    if (!['nodal_officer', 'admin', 'faculty'].includes(marker.role)) {
      return res.status(403).json({ error: 'Insufficient permissions to mark attendance' });
    }

    const course = await Course.findById(course_id).populate('program_id');
    if (!course) return res.status(404).json({ error: 'Course not found' });

    // Node ownership check
    if (!course.program_id.node_id.equals(marker.node_id._id)) {
      return res.status(403).json({ error: 'Course not in your node' });
    }

    // Faculty must be assigned to the course
    if (marker.role === 'faculty') {
      const isAssigned = await FacultyAssignment.findOne({ course_id, faculty_id: marker._id });
      if (!isAssigned) {
        return res.status(403).json({ error: 'You are not assigned to this course' });
      }
    }

    // Validate student and node
    const student = await User.findById(student_id);
    if (!student || student.role !== 'student' || !student.node_id.equals(marker.node_id._id)) {
      return res.status(400).json({ error: 'Invalid student or not in your node' });
    }

    // Ensure student is enrolled in the course
    const enrollment = await Enrollment.findOne({ course_id, student_id });
    if (!enrollment) {
      return res.status(400).json({ error: 'Student is not enrolled in this course' });
    }

    const attDate = new Date(date);

    // Upsert attendance (unique index on course_id, student_id, date)
    const attendance = await Attendance.findOneAndUpdate(
      { course_id, student_id, date: attDate },
      { $set: { status, marked_by: marker._id } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ message: 'Attendance recorded', attendance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get or compute Progress (student can view own; others limited by node)
const getProgress = async (req, res) => {
  try {
    const requester = req.user;
    const { student_id, course_id } = req.query;

    if (requester.role === 'student') {
      if (student_id && student_id !== String(requester._id)) {
        return res.status(403).json({ error: 'Students can only view their own progress' });
      }
    } else {
      if (!student_id) return res.status(400).json({ error: 'student_id is required' });
      const student = await User.findById(student_id);
      if (!student || !student.node_id.equals(requester.node_id._id)) {
        return res.status(403).json({ error: 'Student not in your node' });
      }
    }

    const targetStudentId = requester.role === 'student' ? requester._id : student_id;

    // If a course_id is specified, compute/update one, else return all per courses
    const computeForCourse = async (cid) => {
      // Attendance percentage
      const records = await Attendance.find({ course_id: cid, student_id: targetStudentId });
      const total = records.length;
      const present = records.filter(r => r.status === 'present').length;
      const attendancePct = total === 0 ? 0 : (present / total) * 100;

      // Credits earned (sum)
      const credits = await Credit.find({ course_id: cid, student_id: targetStudentId });
      const creditsSum = credits.reduce((sum, c) => sum + parseFloat(c.credits_earned.toString()), 0);

      // Upsert progress
      const progress = await Progress.findOneAndUpdate(
        { student_id: targetStudentId, course_id: cid },
        { $set: { attendance_pct: attendancePct, credits_earned: creditsSum } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      return progress;
    };

    if (course_id) {
      const progress = await computeForCourse(course_id);
      return res.json({ progress });
    }

    // Find all courses student is enrolled in (limit to same node implicitly by enrollments)
    const enrollments = await Enrollment.find({ student_id: targetStudentId });
    const progresses = [];
    for (const e of enrollments) {
      progresses.push(await computeForCourse(e.course_id));
    }
    res.json({ progress: progresses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Generate Certificate (admin, nodal_officer)
const generateCertificate = async (req, res) => {
  try {
    const issuer = req.user;
    const { course_id, student_id, certificate_url } = req.body;

    if (!['nodal_officer', 'admin'].includes(issuer.role)) {
      return res.status(403).json({ error: 'Insufficient permissions to generate certificates' });
    }

    if (!course_id || !student_id || !certificate_url) {
      return res.status(400).json({ error: 'course_id, student_id, certificate_url are required' });
    }

    const course = await Course.findById(course_id).populate('program_id');
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (!course.program_id.node_id.equals(issuer.node_id._id)) {
      return res.status(403).json({ error: 'Course not in your node' });
    }

    const student = await User.findById(student_id);
    if (!student || !student.node_id.equals(issuer.node_id._id)) {
      return res.status(403).json({ error: 'Student not in your node' });
    }

    const enrollment = await Enrollment.findOne({ course_id, student_id });
    if (!enrollment) {
      return res.status(400).json({ error: 'Student is not enrolled in this course' });
    }

    const cert = new Certificate({ course_id, student_id, issued_date: new Date(), certificate_url });
    await cert.save();

    res.status(201).json({ message: 'Certificate issued', certificate: cert });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
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
};