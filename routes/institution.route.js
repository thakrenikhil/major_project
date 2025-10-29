const express = require('express');
const {
  registerInstitution,
  assignNodalOfficer,
  verifyInstitution,
  getInstitutions,
  getInstitutionById
} = require('../controllers/institution.controller');
const { auth, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Public routes
router.post('/register', registerInstitution);

// Protected routes
router.get('/', auth, authorize('nodal_officer', 'gsp_authority','admin' ), getInstitutions);
router.get('/:id', auth, authorize('nodal_officer', 'gsp_authority'), getInstitutionById);
router.post('/assign-nodal-officer', auth, authorize('gsp_authority'), assignNodalOfficer);
router.post('/verify', auth, authorize('nodal_officer'), verifyInstitution);

module.exports = router;
