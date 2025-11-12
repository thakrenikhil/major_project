const Certificate = require("../models/certificate.model");
const Course = require("../models/course.model");
const Enrollment = require("../models/enrollment.model");
const Feedback = require("../models/feedback.model");
const Attendance = require("../models/attendance.model");
const {
  genCertificate,
} = require("../utils/GenerateCertificate/genCertificate");
// Helper function to generate padded numbers
const padNumber = (num, width) => {
  return String(num).padStart(width, "0");
};

// Helper function to get year and month in required format
const getYearMonth = (date) => {
  const d = new Date(date);
  return {
    year: d.getFullYear().toString().slice(-2),
    month: padNumber(d.getMonth() + 1, 2),
  };
};

// Helper function to get next certificate number
const getNextCertificateNumber = async () => {
  // Look for the highest certificate number from unique_hash field
  const lastCertificate = await Certificate.findOne(
    { unique_hash: { $regex: /SSRGSP\/.*\/\d{4}$/ } },
    { unique_hash: 1 }
  ).sort({ unique_hash: -1 });

  if (!lastCertificate) return 1;

  // Extract the last number from the SSRGSP code
  const match = lastCertificate.unique_hash.match(/(\d{4})$/);
  return match ? parseInt(match[1]) + 1 : 1;
};

// Helper function to generate certificate code
const generateCertificateCode = async (
  course,
  institution,
  certificateNumber
) => {
  if (!course || !institution) {
    throw new Error("Course and institution details are required");
  }

  const { year, month } = getYearMonth(course.start_date);
  const location = institution.city.substring(0, 3).toUpperCase();
  const courseType = course.course_name.substring(0, 3).toUpperCase();
  const batchNo = "01";
  const certNo = padNumber(certificateNumber, 4);

  return `SSRGSP/${courseType}/${location}/${year}/${month}/${batchNo}/${certNo}`;
};

// Request Certificate (Student)
const requestCertificate = async (req, res) => {
  try {
    const { course_id } = req.body;
    const student = req.user;

    if (student.role !== "student") {
      return res
        .status(403)
        .json({ error: "Only students can request certificates" });
    }

    if (!course_id) {
      return res.status(400).json({ error: "Course ID is required" });
    }

    // Check if student is enrolled
    const enrollment = await Enrollment.findOne({
      course_id,
      student_id: student._id,
    });

    if (!enrollment) {
      return res
        .status(400)
        .json({ error: "Student is not enrolled in this course" });
    }

    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({
      course_id,
      student_id: student._id,
    });

    if (existingCertificate) {
      return res
        .status(400)
        .json({ error: "Certificate already requested for this course" });
    }

    // Check if student has submitted feedback
    const feedback = await Feedback.findOne({
      student_id: student._id,
      course_id,
    });
    if (false || !feedback) {
      return res.status(400).json({
        error: "Student must submit feedback before requesting certificate",
      });
    }

    // Check attendance requirements (minimum 80% attendance)
    const attendanceRecords = await Attendance.find({
      course_id,
      student_id: student._id,
      status: "present",
    });

    const totalClasses = await Attendance.distinct("date", { course_id });
    const attendancePercentage =
      totalClasses.length > 0
        ? (attendanceRecords.length / totalClasses.length) * 100
        : 0;

    if (attendancePercentage < 80) {
      return res.status(400).json({
        error: "Minimum 80% attendance required for certificate",
        current_attendance: attendancePercentage,
      });
    }

    const certificate = new Certificate({
      course_id,
      student_id: student._id,
      status: "requested",
      requested_date: new Date(),
	  issued_date:new Date(),
    });

    await certificate.save();

    res.status(201).json({
      message: "Certificate request submitted successfully",
      certificate,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Verify Certificate (Nodal Officer)
const verifyCertificate = async (req, res) => {
  try {
    const { certificate_id, action } = req.body; // action: 'approve' or 'reject'
    const verifier = req.user;

    if (verifier.role !== "nodal_officer") {
      return res
        .status(403)
        .json({ error: "Only nodal officers can verify certificates" });
    }

    if (!certificate_id || !action) {
      return res
        .status(400)
        .json({ error: "Certificate ID and action are required" });
    }

    const certificate = await Certificate.findById(certificate_id)
      .populate("course_id")
      .populate("student_id");

    if (!certificate) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    // Check if certificate is in the nodal officer's node
    if (!certificate.course_id.nodal_officer.equals(verifier._id)) {
      return res
        .status(403)
        .json({ error: "Certificate not in your jurisdiction" });
    }

    if (action === "approve") {
      certificate.status = "verified";
      certificate.verified_date = new Date();
      certificate.verified_by = verifier._id;
    } else if (action === "reject") {
      certificate.status = "requested"; // Reset to requested for resubmission
    } else {
      return res
        .status(400)
        .json({ error: 'Invalid action. Use "approve" or "reject"' });
    }

    await certificate.save();

    res.json({
      message: `Certificate ${action}d successfully`,
      certificate,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Institution Sign Certificate
const institutionSignCertificate = async (req, res) => {
  try {
    const { certificate_id, institution_signature } = req.body;
    const signer = req.user;

    if (signer.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Only institution admins can sign certificates" });
    }

    if (!certificate_id || !institution_signature) {
      return res.status(400).json({
        error: "Certificate ID and institution signature are required",
      });
    }

    const certificate = await Certificate.findById(certificate_id);

    if (!certificate) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    if (certificate.status !== "verified") {
      return res.status(400).json({
        error: "Certificate must be verified before institution signing",
      });
    }

    certificate.status = "institution_signed";
    certificate.institution_signed_date = new Date();
    certificate.institution_signature = institution_signature;

    await certificate.save();

    res.json({
      message: "Certificate signed by institution successfully",
      certificate,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GSP Authority Approve Certificate
const gspApproveCertificate = async (req, res) => {
  try {
    const { certificate_id, gsp_signature } = req.body;
    const approver = req.user;

    if (approver.role !== "gsp_authority") {
      return res
        .status(403)
        .json({ error: "Only GSP Authority can approve certificates" });
    }

    if (!certificate_id || !gsp_signature) {
      return res
        .status(400)
        .json({ error: "Certificate ID and GSP signature are required" });
    }

    const certificate = await Certificate.findById(certificate_id);

    if (!certificate) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    if (certificate.status !== "institution_signed") {
      return res.status(400).json({
        error: "Certificate must be institution signed before GSP approval",
      });
    }

    certificate.status = "gsp_approved";
    certificate.gsp_approved_date = new Date();
    certificate.gsp_approved_by = approver._id;
    certificate.gsp_signature = gsp_signature;

    await certificate.save();

    res.json({
      message: "Certificate approved by GSP Authority successfully",
      certificate,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Issue Certificate (Final step)
const issueCertificate = async (req, res) => {
  try {
    const { certificate_id } = req.body;
    const issuer = req.user;

    if (!["nodal_officer", "admin", "gsp_authority"].includes(issuer.role)) {
      return res
        .status(403)
        .json({ error: "Insufficient permissions to issue certificates" });
    }

    if (!certificate_id) {
      return res.status(400).json({ error: "Certificate ID  are required" });
    }

    const certificate = await Certificate.findById(certificate_id)
      .populate({
        path: "course_id",
        populate: {
          path: "institution_id",
        },
      })
      .populate("student_id");

    if (!certificate) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    if (certificate.status !== "gsp_approved") {
      return res
        .status(400)
        .json({ error: "Certificate must be GSP approved before issuing" });
    }

    // Generate SSRGSP code and store in unique_hash
    const certificateNumber = await getNextCertificateNumber();
    const ssrgspCode = await generateCertificateCode(
      certificate.course_id,
      certificate.course_id.institution_id,
      certificateNumber
    );

    certificate.status = "issued";
    certificate.certificate_url = await genCertificate(
      certificate.student_id.name,
      certificate.course_id.course_name
    );
    certificate.issued_date = new Date();
    certificate.unique_hash = ssrgspCode;

    await certificate.save();

    res.json({
      message: "Certificate issued successfully",
      certificate,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Certificates (with role-based filtering)
const getCertificates = async (req, res) => {
  try {
    const user = req.user;
    const { status, course_id, student_id } = req.query;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (course_id) {
      query.course_id = course_id;
    }

    if (student_id) {
      query.student_id = student_id;
    }

    // Role-based filtering
    if (user.role === "student") {
      query.student_id = user._id;
    } else if (user.role === "nodal_officer") {
      // Nodal officer can see certificates for courses in their node
      console.log("yes");
      console.log(user);
      const courses = await Course.find({
        nodal_officer: user._id,
      });
      query.course_id = { $in: courses.map((c) => c._id) };
    }

    const certificates = await Certificate.find(query)
      .populate("course_id", "course_name")
      .populate("student_id", "name email")
      .populate("verified_by", "name email")
      .populate("gsp_approved_by", "name email")
      .sort({ createdAt: -1 });

    res.json({ certificates });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Download Certificate (Student)
const downloadCertificate = async (req, res) => {
  try {
    const { certificate_id } = req.params;
    const student = req.user;

    if (student.role !== "student") {
      return res
        .status(403)
        .json({ error: "Only students can download certificates" });
    }

    const certificate = await Certificate.findById(certificate_id);

    if (!certificate) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    if (!certificate.student_id.equals(student._id)) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (certificate.status !== "issued") {
      return res.status(400).json({ error: "Certificate not yet issued" });
    }

    // Increment download count
    certificate.download_count += 1;
    await certificate.save();

    res.json({
      message: "Certificate download initiated",
      certificate_url: certificate.certificate_url,
      download_count: certificate.download_count,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search certificate by code
const searchCertificateByCode = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: "Certificate code is required" });
    }

    const certificate = await Certificate.findOne({ unique_hash: code })
      .populate({
        path: "course_id",
        populate: {
          path: "institution_id",
        },
      })
      .populate("student_id", "name email")
      .populate("verified_by", "name email")
      .populate("gsp_approved_by", "name email");

    if (!certificate) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    // Parse certificate code for detailed information
    const [prefix, courseType, location, year, month, batchNo, certNo] =
      certificate.unique_hash.split("/");

    const decodedInfo = {
      prefix,
      courseType,
      location,
      year: `20${year}`,
      month,
      batchNo,
      certificateNumber: certNo,
      fullDetails: certificate,
    };

    res.json(decodedInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  requestCertificate,
  verifyCertificate,
  institutionSignCertificate,
  gspApproveCertificate,
  issueCertificate,
  getCertificates,
  downloadCertificate,
  searchCertificateByCode,
};
