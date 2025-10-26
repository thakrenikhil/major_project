const Course = require("../models/course.model");
const User = require("../models/user.model");
const Institution = require("../models/institution.model");
const Enrollment = require("../models/enrollment.model");
const Payment = require("../models/payment.model");

// Create Course (Institution Admin)
const createCourse = async (req, res) => {
  try {
    const {
      institution_id,
      course_name,
      title,
      description,
      duration,
      start_date,
      end_date,
      trainer_name,
      trainer_email,
      course_timing,
      course_fee,
      is_gsp_course,
      nodal_officer,
      industry_partner_name,
    } = req.body;

    const creator = req.user;

    if (creator.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Only institution admins can create courses" });
    }

    // Validate required fields
    if (
      !institution_id ||
      !course_name ||
      !title ||
      !duration ||
      !start_date ||
      !end_date ||
      !trainer_name ||
      !trainer_email ||
      !course_timing ||
      !nodal_officer
    ) {
      return res
        .status(400)
        .json({ error: "All required fields must be provided" });
    }

    // Validate institution belongs to admin's node
    const institution = await Institution.findById(institution_id);
    if (
      !institution ||
      institution.assigned_node_id.toString() !== creator.node_id._id.toString()
    ) {
      return res
        .status(403)
        .json({ error: "Institution not in your jurisdiction" });
    }

    // Validate nodal officer
    const nodalOfficer = await User.findById(nodal_officer);
    if (
      !nodalOfficer ||
      nodalOfficer.role !== "nodal_officer" ||
      !nodalOfficer.node_id.toString(creator.node_id)
    ) {
      return res.status(400).json({ error: "Invalid nodal officer" });
    }

    const course = new Course({
      institution_id,
      course_name,
      title,
      description,
      duration,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      trainer_name,
      trainer_email,
      course_timing,
      course_fee: course_fee || 0,
      is_gsp_course: is_gsp_course || false,
      nodal_officer,
      industry_partner_name,
      status: "CREATED",
      created_by: creator._id,
    });

    await course.save();

    res.status(201).json({
      message: "Course created successfully. Awaiting approval.",
      course,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Approve Course (GSP Authority)
const approveCourse = async (req, res) => {
  try {
    const { course_id, action } = req.body; // action: 'approve' or 'reject'
    const approver = req.user;

    if (approver.role !== "gsp_authority") {
      return res
        .status(403)
        .json({ error: "Only GSP Authority can approve courses" });
    }

    if (!course_id || !action) {
      return res
        .status(400)
        .json({ error: "Course ID and action are required" });
    }

    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (course.status !== "CREATED") {
      return res.status(400).json({ error: "Course is not in CREATED status" });
    }

    if (action === "approve") {
      course.status = "APPROVED";
      course.approval_date = new Date();
      course.approved_by = approver._id;
    } else if (action === "reject") {
      course.status = "CANCELLED";
    } else {
      return res
        .status(400)
        .json({ error: 'Invalid action. Use "approve" or "reject"' });
    }

    await course.save();

    res.json({
      message: `Course ${action}d successfully`,
      course,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Start Course (Nodal Officer)
const startCourse = async (req, res) => {
  try {
    const { course_id } = req.body;
    const starter = req.user;

    if (starter.role !== "nodal_officer") {
      return res
        .status(403)
        .json({ error: "Only nodal officers can start courses" });
    }

    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (!course.nodal_officer.equals(starter._id)) {
      return res
        .status(403)
        .json({ error: "You can only start courses assigned to you" });
    }

    if (course.status !== "APPROVED") {
      return res
        .status(400)
        .json({ error: "Course must be approved before starting" });
    }

    course.status = "IN_PROGRESS";
    await course.save();

    res.json({
      message: "Course started successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Complete Course (Nodal Officer)
const completeCourse = async (req, res) => {
  try {
    const { course_id } = req.body;
    const completer = req.user;

    if (completer.role !== "nodal_officer") {
      return res
        .status(403)
        .json({ error: "Only nodal officers can complete courses" });
    }

    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (!course.nodal_officer.equals(completer._id)) {
      return res
        .status(403)
        .json({ error: "You can only complete courses assigned to you" });
    }

    if (course.status !== "IN_PROGRESS") {
      return res
        .status(400)
        .json({ error: "Course must be in progress to complete" });
    }

    course.status = "COMPLETED";
    course.completion_date = new Date();
    await course.save();

    res.json({
      message: "Course completed successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Courses (with role-based filtering)
const getCourses = async (req, res) => {
  try {
    const user = req.user;
    const { status, institution_id } = req.query;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (institution_id) {
      query.institution_id = institution_id;
    }

    // Role-based filtering
    if (user.role === "nodal_officer") {
      query.nodal_officer = user._id;
    } else if (user.role === "admin") {
      // Admin can see courses from their institution
      const institutions = await Institution.find({
        assigned_node_id: user.node_id,
      });
      query.institution_id = { $in: institutions.map((i) => i._id) };
    } else if (user.role === "student") {
      // Students can see courses they're enrolled in
      const enrollments = await Enrollment.find({ student_id: user._id });
      query._id = { $in: enrollments.map((e) => e.course_id) };
    }

    const courses = await Course.find(query)
      .populate("program_id", "program_name")
      .populate("institution_id", "name")
      .populate("nodal_officer", "name email")
      .populate("approved_by", "name email")
      .populate("created_by", "name email")
      .sort({ createdAt: -1 });

    res.json({ courses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Course by ID
const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const course = await Course.findById(id)
      .populate("program_id", "program_name")
      .populate("institution_id", "name")
      .populate("nodal_officer", "name email")
      .populate("approved_by", "name email")
      .populate("created_by", "name email");

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Check permissions
    if (
      user.role === "nodal_officer" &&
      !course.nodal_officer.equals(user._id)
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json({ course });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createCourse,
  approveCourse,
  startCourse,
  completeCourse,
  getCourses,
  getCourseById,
};
