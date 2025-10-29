const express = require("express");
const {
  login,
  createUser,
  getProfile,
  getUsers,
  enrollStudent,
  getCourses,
  markAttendance,
  getProgress,
  generateCertificate,
  getNodalOfficers,
  BulkMarkAttendance,
} = require("../controllers/auth.controller");
const { auth, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

// Public routes
router.post("/login", login);

// Protected routes
router.get("/profile", auth, getProfile);
router.post(
  "/create-user",
  auth,
  authorize("nodal_officer", "admin"),
  createUser
);
router.get("/users", auth, authorize("nodal_officer", "admin"), getUsers);

// Course routes
router.get("/courses", auth, getCourses);

// Enrollment routes
router.post(
  "/enroll",
  auth,
  authorize("nodal_officer", "admin"),
  enrollStudent
);

// Attendance routes
router.post(
  "/attendance",
  auth,
  authorize("nodal_officer", "admin", "faculty"),
  markAttendance
);
//
router.post(
  "/bulk-mark-attendance",
  auth,
  authorize("nodal_officer", "admin", "faculty"),
  BulkMarkAttendance
);
// Progress routes
router.get("/progress", auth, getProgress);

// Certificate routes
router.post(
  "/certificates",
  auth,
  authorize("nodal_officer", "admin"),
  generateCertificate
);

// Fetch all nodal officers (for assignment)
router.get(
  "/nodal-officers",
  auth,
  authorize("gsp_authority", "admin"),
  getNodalOfficers
);

module.exports = router;
