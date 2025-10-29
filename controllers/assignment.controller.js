const Assignment = require("../models/assignment.model");
const AssignmentSubmission = require("../models/assignmentSubmission.model");
const Course = require("../models/course.model");
const User = require("../models/user.model");
const Enrollment = require("../models/enrollment.model");

// Create Assignment (Faculty/Admin)
const createAssignment = async (req, res) => {
  try {
    const {
      course_id,
      title,
      description,
      instructions,
      due_date,
      max_marks,
      weightage,
      assignment_type,
    } = req.body;

    const creator = req.user;

    if (!["faculty", "admin"].includes(creator.role)) {
      return res
        .status(403)
        .json({ error: "Only faculty and admins can create assignments" });
    }

    // Validate required fields
    if (
      !course_id ||
      !title ||
      !description ||
      !due_date ||
      !max_marks ||
      !weightage
    ) {
      return res
        .status(400)
        .json({ error: "All required fields must be provided" });
    }

    // Check if course exists and is in progress
    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (course.status !== "IN_PROGRESS") {
      return res
        .status(400)
        .json({ error: "Course must be in progress to create assignments" });
    }

    const assignment = new Assignment({
      course_id,
      title,
      description,
      instructions,
      due_date: new Date(due_date),
      max_marks,
      weightage,
      assignment_type: assignment_type || "individual",
      created_by: creator._id,
    });

    await assignment.save();

    res.status(201).json({
      message: "Assignment created successfully",
      assignment,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Publish Assignment
const publishAssignment = async (req, res) => {
  try {
    const { assignment_id } = req.body;
    const publisher = req.user;

    if (!["faculty", "admin"].includes(publisher.role)) {
      return res
        .status(403)
        .json({ error: "Only faculty and admins can publish assignments" });
    }

    const assignment = await Assignment.findById(assignment_id);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    if (assignment.status !== "draft") {
      return res
        .status(400)
        .json({ error: "Assignment is not in draft status" });
    }

    assignment.status = "published";
    await assignment.save();

    res.json({
      message: "Assignment published successfully",
      assignment,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Submit Assignment (Student)
const submitAssignment = async (req, res) => {
  try {
    const { assignment_id, submission_text, submission_files } = req.body;
    const student = req.user;
    if (student.role !== "student") {
      return res
        .status(403)
        .json({ error: "Only students can submit assignments" });
    }

    if (!assignment_id) {
      return res.status(400).json({ error: "Assignment ID is required" });
    }

    const assignment = await Assignment.findById(assignment_id);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    if (assignment.status !== "published") {
      return res.status(400).json({ error: "Assignment is not published" });
    }

    // Check if student is enrolled in the course
    const enrollment = await Enrollment.findOne({
      course_id: assignment.course_id,
      student_id: student._id,
    });

    if (!enrollment) {
      return res
        .status(400)
        .json({ error: "Student is not enrolled in this course" });
    }

    // Check if already submitted
    const existingSubmission = await AssignmentSubmission.findOne({
      assignment_id,
      student_id: student._id,
    });

    if (existingSubmission) {
      return res.status(400).json({ error: "Assignment already submitted" });
    }

    const submissionDate = new Date();
    const dueDate = new Date(assignment.due_date);
    const isLate = submissionDate > dueDate;
    const lateDays = isLate
      ? Math.ceil((submissionDate - dueDate) / (1000 * 60 * 60 * 24))
      : 0;

    const submission = new AssignmentSubmission({
      assignment_id,
      student_id: student._id,
      course_id: assignment.course_id,
      submission_text,
      submission_files: submission_files || [],
      submission_date: submissionDate,
      is_late: isLate,
      late_days: lateDays,
    });

    await submission.save();

    res.status(201).json({
      message: "Assignment submitted successfully",
      submission,
      is_late: isLate,
      late_days: lateDays,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const bulkSubmitAssignment = async (req, res) => {
  var { assignment_id, student_id, course_id, graded_by } = req.body;
  if (!assignment_id || !student_id || !course_id || !graded_by) {
    return res.status(400).json({ error: "bad request" });
  }
  arrayOf_student_id = student_id.split(",");
  data = arrayOf_student_id.map((id) => {
    return { assignment_id, student_id: id, course_id, graded_by };
  });
  AssignmentSubmission.insertMany(data);
  return res.status(200).json({ message: "done" });
};

// Grade Assignment (Faculty/Admin)
const gradeAssignment = async (req, res) => {
  try {
    const { submission_id, marks_obtained, feedback } = req.body;

    const grader = req.user;

    if (!["faculty", "admin"].includes(grader.role)) {
      return res
        .status(403)
        .json({ error: "Only faculty and admins can grade assignments" });
    }

    if (!submission_id || marks_obtained === undefined) {
      return res
        .status(400)
        .json({ error: "Submission ID and marks are required" });
    }

    const submission = await AssignmentSubmission.findById(submission_id);
    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    if (submission.status !== "submitted") {
      return res
        .status(400)
        .json({ error: "Submission is not in submitted status" });
    }

    submission.marks_obtained = marks_obtained;
    submission.feedback = feedback;
    submission.graded_by = grader._id;
    submission.graded_date = new Date();
    submission.status = "graded";

    await submission.save();

    res.json({
      message: "Assignment graded successfully",
      submission,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Assignments for Course
const getAssignments = async (req, res) => {
  try {
    const { course_id } = req.params;
    const user = req.user;

    if (!course_id) {
      return res.status(400).json({ error: "Course ID is required" });
    }

    // Check if user has access to the course
    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Role-based access control
    if (user.role === "student") {
      const enrollment = await Enrollment.findOne({
        course_id,
        student_id: user._id,
      });
      if (!enrollment) {
        return res.status(403).json({ error: "Not enrolled in this course" });
      }
    } else if (
      user.role === "nodal_officer" &&
      !course.nodal_officer.equals(user._id)
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    const assignments = await Assignment.find({ course_id })
      .populate("created_by", "name email")
      .sort({ createdAt: -1 });

    res.json({ assignments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Assignment Submissions
const getSubmissions = async (req, res) => {
  try {
    const { assignment_id } = req.query;
    const user = req.user;

    if (!assignment_id) {
      return res.status(400).json({ error: "Assignment ID is required" });
    }

    const assignment = await Assignment.findById(assignment_id);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    // Check permissions
    if (user.role === "student") {
      const enrollment = await Enrollment.findOne({
        course_id: assignment.course_id,
        student_id: user._id,
      });
      if (!enrollment) {
        return res.status(403).json({ error: "Not enrolled in this course" });
      }
    }

    let query = { assignment_id };

    // Students can only see their own submissions
    if (user.role === "student") {
      query.student_id = user._id;
    }

    const submissions = await AssignmentSubmission.find(query)
      .populate("student_id", "name email")
      .populate("graded_by", "name email")
      .sort({ submission_date: -1 });

    res.json({ submissions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createAssignment,
  publishAssignment,
  submitAssignment,
  gradeAssignment,
  getAssignments,
  getSubmissions,
  bulkSubmitAssignment,
};
