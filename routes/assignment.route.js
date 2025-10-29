const express = require("express");
const {
  createAssignment,
  publishAssignment,
  submitAssignment,
  gradeAssignment,
  getAssignments,
  getSubmissions,
  bulkSubmitAssignment,
} = require("../controllers/assignment.controller");
const { auth, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

// Protected routes
router.post("/create", auth, authorize("faculty", "admin"), createAssignment);
router.post("/publish", auth, authorize("faculty", "admin"), publishAssignment);
router.post("/submit", auth, authorize("student"), submitAssignment);
router.post("/grade", auth, authorize("faculty", "admin"), gradeAssignment);
router.get("/getAssignmentInCourse/:course_id", auth, getAssignments);
router.get("/submissions", auth, getSubmissions);
router.post("/bulkSubmit", auth, bulkSubmitAssignment);

module.exports = router;
