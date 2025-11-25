const express = require("express");
const multer = require("multer");
const {
  registerStudent,
  bulkRegisterStudents,
  enrollStudent,
  bulkEnrollStudents,
  getStudents,
  getStudentById,
  getStudentByCourseId,
} = require("../controllers/student.controller");
const { auth, authorize } = require("../middlewares/auth.middleware");

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// Protected routes
router.post(
  "/register",
  auth,
  authorize("nodal_officer", "admin"),
  registerStudent
);
router.post(
  "/bulk-register",
  auth,
  authorize("nodal_officer", "admin"),
  (req, res, next) => {
    upload.any()(req, res, (err) => {
      if (err) {
        return res
          .status(400)
          .json({ error: "File upload error: " + err.message });
      }
      next();
    });
  },
  bulkRegisterStudents
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
