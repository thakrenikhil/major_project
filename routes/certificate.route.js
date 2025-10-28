const express = require("express");
const {
  requestCertificate,
  verifyCertificate,
  institutionSignCertificate,
  gspApproveCertificate,
  issueCertificate,
  getCertificates,
  downloadCertificate,
  searchCertificateByCode,
} = require("../controllers/certificate.controller");
const { auth, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

// Protected routes
router.post("/request", auth, authorize("student"), requestCertificate);
router.get("/", auth, getCertificates);
router.get(
  "/download/:certificate_id",
  auth,
  authorize("student"),
  downloadCertificate
);
router.post("/verify", auth, authorize("nodal_officer"), verifyCertificate);
router.post(
  "/institution-sign",
  auth,
  authorize("admin"),
  institutionSignCertificate
);
router.post(
  "/gsp-approve",
  auth,
  authorize("gsp_authority"),
  gspApproveCertificate
);
router.post(
  "/issue",
  auth,
  authorize("nodal_officer", "admin", "gsp_authority"),
  issueCertificate
);
router.get("/search", auth, searchCertificateByCode);

module.exports = router;
