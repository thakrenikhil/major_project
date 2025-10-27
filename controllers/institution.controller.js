const Institution = require("../models/institution.model");
const User = require("../models/user.model");
const Node = require("../models/node.model");

// Register Institution
const registerInstitution = async (req, res) => {
  try {
    const {
      name,
      course_name,
      coordinator_name,
      coordinator_email,
      coordinator_phone,
      trainer_name,
      trainer_email,
      trainer_phone,
      address,
      state,
      city,
      pincode,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !course_name ||
      !coordinator_name ||
      !coordinator_email ||
      !coordinator_phone ||
      !trainer_name ||
      !trainer_email ||
      !trainer_phone ||
      !address ||
      !state ||
      !city ||
      !pincode
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if institution already exists
    const existingInstitution = await Institution.findOne({
      $or: [{ name, course_name }, { coordinator_email }, { trainer_email }],
    });

    if (existingInstitution) {
      return res
        .status(400)
        .json({
          error: "Institution already registered or email already in use",
        });
    }

    const institution = new Institution({
      name,
      course_name,
      coordinator_name,
      coordinator_email,
      coordinator_phone,
      trainer_name,
      trainer_email,
      trainer_phone,
      address,
      state,
      city,
      pincode,
      status: "pending",
    });

    await institution.save();

    res.status(201).json({
      message:
        "Institution registered successfully. Awaiting nodal officer assignment.",
      institution,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Assign Nodal Officer to Institution (GSP Authority only)
const assignNodalOfficer = async (req, res) => {
  try {
    const { institution_id, nodal_officer_id } = req.body;
    const assigner = req.user;

    if (assigner.role !== "gsp_authority") {
      return res
        .status(403)
        .json({ error: "Only GSP Authority can assign nodal officers" });
    }

    if (!institution_id || !nodal_officer_id) {
      return res
        .status(400)
        .json({ error: "Institution ID and Nodal Officer ID are required" });
    }

    const institution = await Institution.findById(institution_id);
    if (!institution) {
      return res.status(404).json({ error: "Institution not found" });
    }

    const nodalOfficer = await User.findById(nodal_officer_id);
    if (!nodalOfficer || nodalOfficer.role !== "nodal_officer") {
      return res.status(400).json({ error: "Invalid nodal officer" });
    }

    institution.assigned_node_id = nodalOfficer.node_id;
    institution.assigned_nodal_officer = nodal_officer_id;
    institution.status = "approved";

    await institution.save();

    res.json({
      message: "Nodal officer assigned successfully",
      institution,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Verify Institution (Nodal Officer)
const verifyInstitution = async (req, res) => {
  try {
    const { institution_id, action } = req.body; // action: 'approve' or 'reject'
    const verifier = req.user;

    if (verifier.role !== "nodal_officer") {
      return res
        .status(403)
        .json({ error: "Only nodal officers can verify institutions" });
    }

    if (!institution_id || !action) {
      return res
        .status(400)
        .json({ error: "Institution ID and action are required" });
    }

    const institution = await Institution.findById(institution_id);
    if (!institution) {
      return res.status(404).json({ error: "Institution not found" });
    }

    if (!institution.assigned_nodal_officer.equals(verifier._id)) {
      return res
        .status(403)
        .json({ error: "You can only verify institutions assigned to you" });
    }

    if (action === "approve") {
      institution.status = "active";
      institution.verification_date = new Date();
      institution.verified_by = verifier._id;
    } else if (action === "reject") {
      institution.status = "rejected";
      institution.verification_date = new Date();
      institution.verified_by = verifier._id;
    } else {
      return res
        .status(400)
        .json({ error: 'Invalid action. Use "approve" or "reject"' });
    }

    await institution.save();

    res.json({
      message: `Institution ${action}d successfully`,
      institution,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Institutions (with filters based on role)
const getInstitutions = async (req, res) => {
  try {
    const user = req.user;
    let query = {};
    if (user.role === "nodal_officer" ) {
      console.log("Fetching institutions");
      query.assigned_nodal_officer = user._id;
    } else if (user.role === "gsp_authority") {
      // GSP Authority can see all institutions
    } else if(user.role === "admin" ){
      query.coordinator_email = user.email;
    }else {
      console.log(user.role);
      console.log("yes");
      console.log(query);
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    console.log(user);
    console.log("yes");
    console.log(query);
    const institutions = await Institution.find(query)
      .populate("assigned_nodal_officer", "name email")
      .populate("verified_by", "name email")
      .sort({ createdAt: -1 });

      // if(institutions.length === 0){
      //   institutions = await 
      // }
    console.log(institutions);
    res.json({ institutions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Institution by ID
const getInstitutionById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const institution = await Institution.findById(id)
      .populate("assigned_nodal_officer", "name email")
      .populate("verified_by", "name email");

    if (!institution) {
      return res.status(404).json({ error: "Institution not found" });
    }

    // Check permissions
    if (
      user.role === "nodal_officer" &&
      !institution.assigned_nodal_officer.equals(user._id)
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json({ institution });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerInstitution,
  assignNodalOfficer,
  verifyInstitution,
  getInstitutions,
  getInstitutionById,
};
