const express = require("express");
const {
  registerStudent,
  enrollStudent,
  bulkEnrollStudents,
  getStudents,
  getStudentById,
  getStudentByCourseId,
} = require("../controllers/student.controller");
const { auth, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

// Protected routes
router.post(
  "/register",
  auth,
  authorize("nodal_officer", "admin"),
  registerStudent
);
router.post(
  "/enroll",
  auth,
  authorize("nodal_officer", "admin"),
  enrollStudent
);
router.post(
  "/bulk-enroll",
  auth,
  authorize("nodal_officer", "admin"),
  bulkEnrollStudents
);
router.get("/", auth, getStudents);
router.get("/:id", auth, getStudentById);
router.get(
  "/student-by-course-id/:course_id",
  auth,
  authorize("faculty"),
  getStudentByCourseId
);

module.exports = router;
