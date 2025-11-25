const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
require("dotenv").config();

const Node = require("../models/node.model");
const User = require("../models/user.model");
const Course = require("../models/course.model");
const NodeAssignment = require("../models/nodeAssignment.model");
const FacultyAssignment = require("../models/facultyAssignment.model");
const Enrollment = require("../models/enrollment.model");
const Attendance = require("../models/attendance.model");
const Credit = require("../models/credit.model");
const Certificate = require("../models/certificate.model");
const Progress = require("../models/progress.model");
const Institution = require("../models/institution.model");
const Feedback = require("../models/feedback.model");
const Payment = require("../models/payment.model");
const Assignment = require("../models/assignment.model");
const AssignmentSubmission = require("../models/assignmentSubmission.model");

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing data (optional - uncomment if you want to reset)
    await Node.deleteMany({});
    await User.deleteMany({});
    await Course.deleteMany({});
    await NodeAssignment.deleteMany({});
    await FacultyAssignment.deleteMany({});
    await Enrollment.deleteMany({});
    await Attendance.deleteMany({});
    await Credit.deleteMany({});
    await Certificate.deleteMany({});
    await Progress.deleteMany({});
    await Institution.deleteMany({});
    await Feedback.deleteMany({});
    await Payment.deleteMany({});
    await Assignment.deleteMany({});
    await AssignmentSubmission.deleteMany({});
    console.log("Cleared existing data");

    // Create sample nodes
    const nodes = await Node.create([
      {
        node_name: "Delhi Central Node",
        state_name: "Delhi",
        node_coordinates: "28.6139° N, 77.2090° E",
      },
      {
        node_name: "Mumbai West Node",
        state_name: "Maharashtra",
        node_coordinates: "19.0760° N, 72.8777° E",
      },
      {
        node_name: "Bangalore Tech Node",
        state_name: "Karnataka",
        node_coordinates: "12.9716° N, 77.5946° E",
      },
    ]);

    console.log(
      "Created nodes:",
      nodes.map((n) => n.node_name)
    );

    // Create nodal officers for each node
    const nodalOfficers = await User.create([
      {
        node_id: nodes[0]._id,
        name: "Dr. Rajesh Kumar",
        email: "rajesh.kumar@example.com",
        password_hash: "password123", // Will be hashed by pre-save middleware
        role: "nodal_officer",
      },
      {
        node_id: nodes[1]._id,
        name: "Dr. Priya Sharma",
        email: "priya.sharma@example.com",
        password_hash: "password123", // Will be hashed by pre-save middleware
        role: "nodal_officer",
      },
      {
        node_id: nodes[2]._id,
        name: "Dr. Arjun Patel",
        email: "arjun.patel@example.com",
        password_hash: "password123", // Will be hashed by pre-save middleware
        role: "nodal_officer",
      },
    ]);

    // Update nodes with their nodal officers
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].nodal_officer = nodalOfficers[i]._id;
      await nodes[i].save();
    }

    console.log("Created nodal officers:");
    nodalOfficers.forEach((officer) => {
      console.log(`- ${officer.name} (${officer.email})`);
    });

    // Create admin users for each node
    const admins = await User.create([
      {
        node_id: nodes[0]._id,
        name: "Admin Delhi",
        email: "admin.delhi@example.com",
        password_hash: "password123", // Will be hashed by pre-save middleware
        role: "admin",
        created_by: nodalOfficers[0]._id,
      },
      {
        node_id: nodes[1]._id,
        name: "Admin Mumbai",
        email: "admin.mumbai@example.com",
        password_hash: "password123", // Will be hashed by pre-save middleware
        role: "admin",
        created_by: nodalOfficers[1]._id,
      },
      {
        node_id: nodes[2]._id,
        name: "Admin Bangalore",
        email: "admin.bangalore@example.com",
        password_hash: "password123", // Will be hashed by pre-save middleware
        role: "admin",
        created_by: nodalOfficers[2]._id,
      },
    ]);

    // Create faculty users
    const faculty = await User.create([
      {
        node_id: nodes[0]._id,
        name: "Dr. Sunita Verma",
        email: "sunita.verma@example.com",
        password_hash: "password123", // Will be hashed by pre-save middleware
        role: "faculty",
        created_by: admins[0]._id,
      },
      {
        node_id: nodes[1]._id,
        name: "Prof. Rajesh Gupta",
        email: "rajesh.gupta@example.com",
        password_hash: "password123", // Will be hashed by pre-save middleware
        role: "faculty",
        created_by: admins[0]._id,
      },
      {
        node_id: nodes[2]._id,
        name: "Dr. Meera Joshi",
        email: "meera.joshi@example.com",
        password_hash: "password123", // Will be hashed by pre-save middleware
        role: "faculty",
        created_by: admins[1]._id,
      },
    ]);

    // Create student users
    const students = await User.create([
      {
        node_id: nodes[0]._id,
        name: "Amit Kumar",
        email: "amit.kumar@example.com",
        password_hash: "password123", // Will be hashed by pre-save middleware
        role: "student",
        created_by: admins[0]._id,
      },
      {
        node_id: nodes[0]._id,
        name: "Priya Singh",
        email: "priya.singh@example.com",
        password_hash: "password123", // Will be hashed by pre-save middleware
        role: "student",
        created_by: admins[0]._id,
      },
      {
        node_id: nodes[1]._id,
        name: "Rahul Sharma",
        email: "rahul.sharma@example.com",
        password_hash: "password123", // Will be hashed by pre-save middleware
        role: "student",
        created_by: admins[1]._id,
      },
      {
        node_id: nodes[2]._id,
        name: "Sneha Patel",
        email: "sneha.patel@example.com",
        password_hash: "password123", // Will be hashed by pre-save middleware
        role: "student",
        created_by: admins[2]._id,
      },
    ]);

    // Create GSP Authority
    const gspAuthority = await User.create({
      node_id: nodes[0]._id, // GSP Authority can be in any node
      name: "GSP Authority Head",
      email: "gsp.authority@example.com",
      password_hash: "password123",
      role: "gsp_authority",
    });

    console.log("Created GSP Authority:", gspAuthority.name);

    // Create sample institutions
    const institutions = await Institution.create([
      {
        name: "Tech Institute of Excellence",
        course_name: "Advanced Web Development",
        coordinator_name: "Dr. Sarah Johnson",
        coordinator_email: "sarah.johnson@techinstitute.edu",
        coordinator_phone: "+91-9876543210",
        trainer_name: "Prof. Michael Chen",
        trainer_email: "michael.chen@techinstitute.edu",
        trainer_phone: "+91-9876543211",
        address: "123 Education Street, Tech City",
        state: "Maharashtra",
        city: "Mumbai",
        pincode: "400001",
        status: "active",
        assigned_node_id: nodes[1]._id,
        assigned_nodal_officer: nodalOfficers[1]._id,
        verification_date: new Date(),
        verified_by: nodalOfficers[1]._id,
      },
      {
        name: "Digital Learning Academy",
        course_name: "Data Science Fundamentals",
        coordinator_name: "Dr. Priya Sharma",
        coordinator_email: "priya.sharma@digitalacademy.edu",
        coordinator_phone: "+91-9876543212",
        trainer_name: "Prof. Amit Kumar",
        trainer_email: "amit.kumar@digitalacademy.edu",
        trainer_phone: "+91-9876543213",
        address: "456 Learning Avenue, Knowledge Park",
        state: "Karnataka",
        city: "Bangalore",
        pincode: "560001",
        status: "active",
        assigned_node_id: nodes[2]._id,
        assigned_nodal_officer: nodalOfficers[2]._id,
        verification_date: new Date(),
        verified_by: nodalOfficers[2]._id,
      },
    ]);

    console.log(
      "Created institutions:",
      institutions.map((i) => i.name)
    );

    // Create courses
    const courses = await Course.create([
      {
        institution_id: institutions[0]._id,
        course_name: "Introduction to Programming",
        title: "Complete Programming Bootcamp",
        description: "Basic programming concepts and algorithms",
        duration: 90,
        start_date: new Date("2024-01-15"),
        end_date: new Date("2024-04-15"),
        trainer_name: "Prof. Michael Chen",
        trainer_email: "sunita.verma@example.com",
        course_timing: "9:00 AM - 5:00 PM",
        course_fee: 5000,
        is_gsp_course: true,
        nodal_officer: nodalOfficers[0]._id,
        industry_partner_name: "TechCorp Solutions",
        status: "APPROVED",
        created_by: admins[0]._id,
      },
      {
        institution_id: institutions[0]._id,
        course_name: "Data Structures and Algorithms",
        title: "Advanced DSA Course",
        description: "Advanced data structures and algorithm design",
        duration: 120,
        start_date: new Date("2024-02-01"),
        end_date: new Date("2024-05-01"),
        trainer_name: "Dr. Sarah Johnson",
        trainer_email: "sunita.verma@example.com",
        course_timing: "10:00 AM - 6:00 PM",
        course_fee: 7500,
        is_gsp_course: true,
        nodal_officer: nodalOfficers[0]._id,
        industry_partner_name: "DataTech Inc",
        status: "APPROVED",
        created_by: admins[0]._id,
      },
      {
        institution_id: institutions[1]._id,
        course_name: "Machine Learning Fundamentals",
        title: "ML Fundamentals Course",
        description: "Introduction to machine learning concepts",
        duration: 100,
        start_date: new Date("2024-01-20"),
        end_date: new Date("2024-04-20"),
        trainer_name: "Prof. Amit Kumar",
        trainer_email: "sunita.verma@example.com",
        course_timing: "9:30 AM - 5:30 PM",
        course_fee: 6000,
        is_gsp_course: true,
        nodal_officer: nodalOfficers[1]._id,
        industry_partner_name: "ML Solutions",
        status: "APPROVED",
        created_by: admins[1]._id,
      },
      {
        institution_id: institutions[1]._id,
        course_name: "Web Development",
        title: "Full Stack Web Development",
        description: "Full-stack web development course",
        duration: 110,
        start_date: new Date("2024-02-15"),
        end_date: new Date("2024-05-15"),
        trainer_name: "Prof. Priya Sharma",
        trainer_email: "sunita.verma@example.com",
        course_timing: "9:00 AM - 5:00 PM",
        course_fee: 5500,
        is_gsp_course: true,
        nodal_officer: nodalOfficers[2]._id,
        industry_partner_name: "WebTech Solutions",
        status: "APPROVED",
        created_by: admins[1]._id,
      },
    ]);

    console.log(
      "Created courses:",
      courses.map((c) => c.course_name)
    );

    // Create sample feedback after courses are created
    const feedback = await Feedback.create([
      {
        student_id: students[0]._id,
        course_id: courses[0]._id,
        institution_id: institutions[0]._id,
        rating: 4,
        content_quality: 4,
        instructor_effectiveness: 5,
        course_structure: 4,
        overall_satisfaction: 4,
        comments: "Great course with excellent content and instructor",
        suggestions: "More practical examples would be helpful",
        would_recommend: true,
      },
    ]);

    console.log("Created sample feedback");

    // Create faculty assignments
    await FacultyAssignment.create([
      {
        course_id: courses[0]._id,
        faculty_id: faculty[0]._id,
      },
      {
        course_id: courses[1]._id,
        faculty_id: faculty[1]._id,
      },
      {
        course_id: courses[2]._id,
        faculty_id: faculty[0]._id,
      },
      {
        course_id: courses[3]._id,
        faculty_id: faculty[2]._id,
      },
    ]);

    // Create enrollments
    await Enrollment.create([
      {
        course_id: courses[0]._id,
        student_id: students[0]._id,
      },
      {
        course_id: courses[0]._id,
        student_id: students[1]._id,
      },
      {
        course_id: courses[1]._id,
        student_id: students[0]._id,
      },
      {
        course_id: courses[2]._id,
        student_id: students[1]._id,
      },
      {
        course_id: courses[3]._id,
        student_id: students[2]._id,
      },
    ]);

    // Create sample attendance records
    const attendanceDates = [
      new Date("2024-01-20"),
      new Date("2024-01-25"),
      new Date("2024-01-30"),
    ];

    for (const date of attendanceDates) {
      await Attendance.create([
        {
          course_id: courses[0]._id,
          student_id: students[0]._id,
          date: date,
          status: "present",
          marked_by: faculty[0]._id,
        },
        {
          course_id: courses[0]._id,
          student_id: students[1]._id,
          date: date,
          status: "present",
          marked_by: faculty[0]._id,
        },
      ]);
    }

    // Create sample credits
    await Credit.create([
      {
        course_id: courses[0]._id,
        student_id: students[0]._id,
        credits_earned: 3.0,
        awarded_by: faculty[0]._id,
      },
      {
        course_id: courses[0]._id,
        student_id: students[1]._id,
        credits_earned: 3.0,
        awarded_by: faculty[0]._id,
      },
    ]);

    // Issue sample certificates
    await Certificate.create([
      {
        course_id: courses[0]._id,
        student_id: students[0]._id,
        issued_date: new Date("2024-04-16"),
        certificate_url:
          "https://drive.google.com/file/d/1r8R85voqvtx2obqYt5soUQZ3noxoQTyH/view?usp=drive_link",
      },
      {
        course_id: courses[0]._id,
        student_id: students[1]._id,
        issued_date: new Date("2024-04-16"),
        certificate_url:
          "https://drive.google.com/file/d/1r8R85voqvtx2obqYt5soUQZ3noxoQTyH/view?usp=drive_link",
      },
    ]);

    // Compute and persist progress based on attendance and credits
    const computeProgress = async (studentId, courseId) => {
      const records = await Attendance.find({
        course_id: courseId,
        student_id: studentId,
      });
      const total = records.length;
      const present = records.filter((r) => r.status === "present").length;
      const attendancePct = total === 0 ? 0 : (present / total) * 100;

      const credits = await Credit.find({
        course_id: courseId,
        student_id: studentId,
      });
      const creditsSum = credits.reduce(
        (sum, c) => sum + parseFloat(c.credits_earned.toString()),
        0
      );

      await Progress.findOneAndUpdate(
        { student_id: studentId, course_id: courseId },
        { $set: { attendance_pct: attendancePct, credits_earned: creditsSum } },
        { upsert: true }
      );
    };

    await computeProgress(students[0]._id, courses[0]._id);
    await computeProgress(students[1]._id, courses[0]._id);

    console.log("\n🎉 Comprehensive seed data created successfully!");
    console.log("\nLogin credentials for testing:");
    console.log("\n=== NODAL OFFICERS ===");
    console.log("Email: rajesh.kumar@example.com | Password: password123");
    console.log("Email: priya.sharma@example.com | Password: password123");
    console.log("Email: arjun.patel@example.com | Password: password123");

    console.log("\n=== ADMINS ===");
    console.log("Email: admin.delhi@example.com | Password: password123");
    console.log("Email: admin.mumbai@example.com | Password: password123");
    console.log("Email: admin.bangalore@example.com | Password: password123");

    console.log("\n=== FACULTY ===");
    console.log("Email: sunita.verma@example.com | Password: password123");
    console.log("Email: rajesh.gupta@example.com | Password: password123");
    console.log("Email: meera.joshi@example.com | Password: password123");

    console.log("\n=== STUDENTS ===");
    console.log("Email: amit.kumar@example.com | Password: password123");
    console.log("Email: priya.singh@example.com | Password: password123");
    console.log("Email: rahul.sharma@example.com | Password: password123");
    console.log("Email: sneha.patel@example.com | Password: password123");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

// Run the seed function
seedData();

// package.json scripts section (add these to your package.json)
/*
{
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js",
    "seed": "node scripts/seedData.js"
  }
}
*/

// API Usage Examples

// ========================================
// COMPLETE SSRGSP WORKFLOW TESTING
// ========================================

/*
� CERTIFICATE CODE FORMAT

Each certificate is assigned a unique SSRGSP code in the following format:
SSRGSP/{CourseType}/{Location}/{Year}/{Month}/{BatchNo}/{CertificateNo}

Example: SSRGSP/WEB/BLR/25/08/01/0001

Components:
- SSRGSP: Fixed prefix
- CourseType: First 3 letters of course_name (uppercase)
- Location: First 3 letters of institution city (uppercase)
- Year: Last 2 digits of course start year (YY)
- Month: 2-digit month from course start date (MM)
- BatchNo: Fixed as "01"
- CertificateNo: 4-digit auto-incremented number (0001-9999)

The code is stored in the certificate's unique_hash field and is generated
automatically when the certificate is issued.

�🏛️ INSTITUTION & COURSE LIFECYCLE TESTING

1️⃣ INSTITUTION REGISTRATION
POST http://localhost:3000/api/institutions/register
{
  "name": "Advanced Tech Institute",
  // "course_name": "Full Stack Web Development",
  "coordinator_name": "Dr. Priya Sharma",
  "coordinator_email": "priya.sharma@advtech.edu",
  "coordinator_phone": "+91-9876543210",
  "trainer_name": "Prof. Rajesh Kumar",
  "trainer_email": "rajesh.kumar@advtech.edu",
  "trainer_phone": "+91-9876543211",
  "address": "456 Innovation Street, Tech Hub",
  "state": "Karnataka",
  "city": "Bangalore",
  "pincode": "560001"
}

2️⃣ ASSIGN NODAL OFFICER (GSP Authority)
POST http://localhost:3000/api/institutions/assign-nodal-officer
Authorization: Bearer [GSP_AUTHORITY_TOKEN]
{
  "institution_id": "[INSTITUTION_ID_FROM_STEP_1]",
  "nodal_officer_id": "[NODAL_OFFICER_ID]"
}

3️⃣ VERIFY INSTITUTION (Nodal Officer)
POST http://localhost:3000/api/institutions/verify
Authorization: Bearer [NODAL_OFFICER_TOKEN]
{
  "institution_id": "[INSTITUTION_ID_FROM_STEP_1]",
  "action": "approve"
}

4️⃣ CREATE COURSE (Institution Admin)
POST http://localhost:3000/api/courses/create
Authorization: Bearer [ADMIN_TOKEN]
{
  "institution_id": "[INSTITUTION_ID_FROM_STEP_1]",
  "course_name": "Full Stack Web Development",
  "title": "Complete Web Development Bootcamp",
  "description": "Comprehensive course covering frontend and backend development",
  "duration": 90,
  "start_date": "2024-02-01",
  "end_date": "2024-05-01",
  "trainer_name": "Prof. Rajesh Kumar",
  "trainer_email": "rajesh.kumar@advtech.edu",
  "course_timing": "9:00 AM - 5:00 PM",
  "course_fee": 5000,
  "is_gsp_course": true,
  "nodal_officer": "[NODAL_OFFICER_ID]",
  "industry_partner_name": "TechCorp Solutions"
}

5️⃣ APPROVE COURSE (GSP Authority)-----> nodal officer
POST http://localhost:3000/api/courses/approve
Authorization: Bearer [GSP_AUTHORITY_TOKEN]
{
  "course_id": "[COURSE_ID_FROM_STEP_4]",
  "action": "approve"
}

6️⃣ START COURSE (Nodal Officer)
POST http://localhost:3000/api/courses/start
Authorization: Bearer [NODAL_OFFICER_TOKEN]
{
  "course_id": "[COURSE_ID_FROM_STEP_4]"
}

7️⃣ STUDENT REGISTRATION (Nodal Officer)----------------->(Student)
POST http://localhost:3000/api/students/register
Authorization: Bearer [NODAL_OFFICER_TOKEN]
{
  "name": "Amit Kumar",
  "email": "amit.kumar@example.com",
  "password": "password123",
  "parents_name": "Rajesh Kumar",
  "mobile": "+91-9876543212",
  "address": "123 Student Street, Learning City",
  "govt_id": "123456789012",
  "govt_id_type": "Aadhaar"
}

8️⃣ STUDENT ENROLLMENT (Nodal Officer)----------------->(Admin)
POST http://localhost:3000/api/students/enroll
Authorization: Bearer [NODAL_OFFICER_TOKEN]
{
  "course_id": "[COURSE_ID_FROM_STEP_4]",
  "student_id": "[STUDENT_ID_FROM_STEP_7]"
}

9️⃣ PROCESS PAYMENT (Student - for GSP courses)
POST http://localhost:3000/api/payments/process
Authorization: Bearer [STUDENT_TOKEN]
{
  "course_id": "[COURSE_ID_FROM_STEP_4]",
  "payment_method": "UPI",
  "payment_gateway": "Razorpay",
  "transaction_id": "TXN_123456789"
}

🔟 UPLOAD ATTENDANCE (Faculty/Admin)
POST http://localhost:3000/api/auth/attendance
Authorization: Bearer [FACULTY_TOKEN]
{
  "course_id": "[COURSE_ID_FROM_STEP_4]",
  "student_id": "[STUDENT_ID_FROM_STEP_7]",
  "date": "2024-02-01",
  "status": "present"
}

1️⃣1️⃣ CREATE ASSIGNMENT (Faculty)
POST http://localhost:3000/api/assignments/create
Authorization: Bearer [FACULTY_TOKEN]
{
  "course_id": "[COURSE_ID_FROM_STEP_4]",
  "title": "HTML/CSS Project",
  "description": "Create a responsive website using HTML and CSS",
  "instructions": "Build a portfolio website with at least 3 pages",
  "due_date": "2024-02-15",
  "max_marks": 100,
  "weightage": 20,
  "assignment_type": "individual"
}

1️⃣2️⃣ PUBLISH ASSIGNMENT (Faculty)
POST http://localhost:3000/api/assignments/publish
Authorization: Bearer [FACULTY_TOKEN]
{
  "assignment_id": "[ASSIGNMENT_ID_FROM_STEP_11]"
}

1️⃣3️⃣ SUBMIT ASSIGNMENT (Student)
POST http://localhost:3000/api/assignments/submit
Authorization: Bearer [STUDENT_TOKEN]
{
  "assignment_id": "[ASSIGNMENT_ID_FROM_STEP_11]",
  "submission_text": "I have created a responsive portfolio website with 4 pages: Home, About, Projects, and Contact. The website uses modern CSS techniques including Flexbox and Grid.",
  "submission_files": [
    {
      "filename": "portfolio.zip",
      "original_name": "portfolio_project.zip",
      "file_path": "/uploads/assignments/portfolio.zip",
      "file_size": 2048576,
      "mime_type": "application/zip"
    }
  ]
}

1️⃣4️⃣ GRADE ASSIGNMENT (Faculty)
POST http://localhost:3000/api/assignments/grade
Authorization: Bearer [FACULTY_TOKEN]
{
  "submission_id": "[SUBMISSION_ID_FROM_STEP_13]",
  "marks_obtained": 85,
  "feedback": "Excellent work! The website is responsive and well-structured. Consider adding more interactive elements."
}

1️⃣5️⃣ SUBMIT FEEDBACK (Student)
POST http://localhost:3000/api/feedback/submit
Authorization: Bearer [STUDENT_TOKEN]
{
  "course_id": "[COURSE_ID_FROM_STEP_4]",
  "rating": 5,
  "content_quality": 5,
  "instructor_effectiveness": 5,
  "course_structure": 4,
  "overall_satisfaction": 5,
  "comments": "Excellent course with practical hands-on learning. The instructor was very knowledgeable and helpful.",
  "suggestions": "More real-world project examples would be beneficial",
  "would_recommend": true
}

1️⃣6️⃣ COMPLETE COURSE (Nodal Officer)
POST http://localhost:3000/api/courses/complete
Authorization: Bearer [NODAL_OFFICER_TOKEN]
{
  "course_id": "[COURSE_ID_FROM_STEP_4]"
}

1️⃣7️⃣ REQUEST CERTIFICATE (Student)
POST http://localhost:3000/api/certificates/request
Authorization: Bearer [STUDENT_TOKEN]
{
  "course_id": "[COURSE_ID_FROM_STEP_4]"
}
Response: {
  "message": "Certificate request submitted successfully",
  "certificate": {
    "_id": "...",
    "status": "requested"
  }
}

1️⃣8️⃣ VERIFY CERTIFICATE (Nodal Officer)
POST http://localhost:3000/api/certificates/verify
Authorization: Bearer [NODAL_OFFICER_TOKEN]
{
  "certificate_id": "[CERTIFICATE_ID_FROM_STEP_17]",
  "action": "approve"
}
Response: {
  "message": "Certificate verified successfully",
  "certificate": {
    "status": "verified"
  }
}

1️⃣9️⃣ INSTITUTION SIGN CERTIFICATE (Admin)
POST http://localhost:3000/api/certificates/institution-sign
Authorization: Bearer [ADMIN_TOKEN]
{
  "certificate_id": "[CERTIFICATE_ID_FROM_STEP_17]",
  "institution_signature": "Institution_Digital_Signature_Hash_12345"
}
Response: {
  "message": "Certificate signed by institution successfully",
  "certificate": {
    "status": "institution_signed"
  }
}

2️⃣0️⃣ GSP APPROVE CERTIFICATE (GSP Authority)
POST http://localhost:3000/api/certificates/gsp-approve
Authorization: Bearer [GSP_AUTHORITY_TOKEN]
{
  "certificate_id": "[CERTIFICATE_ID_FROM_STEP_17]",
  "gsp_signature": "GSP_Authority_Digital_Signature_Hash_67890"
}
Response: {
  "message": "Certificate approved by GSP Authority successfully",
  "certificate": {
    "status": "gsp_approved"
  }
}

2️⃣1️⃣ ISSUE CERTIFICATE (Final Step)
POST http://localhost:3000/api/certificates/issue
Authorization: Bearer [NODAL_OFFICER_TOKEN]
{
  "certificate_id": "[CERTIFICATE_ID_FROM_STEP_17]",
  "certificate_url": "https://certificates.ssrgsp.gov.in/cert_12345.pdf"
}
Response: {
  "message": "Certificate issued successfully",
  "certificate": {
    "status": "issued",
    "certificate_url": "https://certificates.ssrgsp.gov.in/cert_12345.pdf",
    "unique_hash": "SSRGSP/WEB/BLR/25/08/01/0001"  // SSRGSP Certificate Code
  }
}

2️⃣2️⃣ SEARCH CERTIFICATE BY CODE
GET http://localhost:3000/api/certificates/search?code=SSRGSP/WEB/BLR/25/08/01/0001
Authorization: Bearer [ANY_VALID_TOKEN]
Response: {
  "prefix": "SSRGSP",
  "courseType": "WEB",       // First 3 letters of course_name
  "location": "BLR",         // First 3 letters of institution city
  "year": "2025",           // From course start_date
  "month": "08",            // From course start_date
  "batchNo": "01",          // Fixed value
  "certificateNumber": "0001", // Auto-incremented
  "fullDetails": {
    // Complete certificate information with populated course and student details
  }
}

2️⃣3️⃣ DOWNLOAD CERTIFICATE (Student)
GET http://localhost:3000/api/certificates/download/[CERTIFICATE_ID_FROM_STEP_17]
Authorization: Bearer [STUDENT_TOKEN]

📊 ADDITIONAL QUERIES & ANALYTICS

23. GET COURSE STATISTICS
GET http://localhost:3000/api/courses?status=COMPLETED
Authorization: Bearer [NODAL_OFFICER_TOKEN]

24. GET PAYMENT STATISTICS
GET http://localhost:3000/api/payments/stats?course_id=[COURSE_ID]
Authorization: Bearer [NODAL_OFFICER_TOKEN]

25. GET FEEDBACK STATISTICS
GET http://localhost:3000/api/feedback/stats?course_id=[COURSE_ID]
Authorization: Bearer [NODAL_OFFICER_TOKEN]

26. GET ASSIGNMENT SUBMISSIONS
GET http://localhost:3000/api/assignments/submissions?assignment_id=[ASSIGNMENT_ID]
Authorization: Bearer [FACULTY_TOKEN]

27. GET STUDENT PROGRESS
GET http://localhost:3000/api/auth/progress
Authorization: Bearer [STUDENT_TOKEN]

28. BULK STUDENT ENROLLMENT (Excel Upload)
POST http://localhost:3000/api/students/bulk-enroll
Authorization: Bearer [NODAL_OFFICER_TOKEN]
{
  "course_id": "[COURSE_ID]",
  "students_data": [
    {
      "name": "Student 1",
      "email": "student1@example.com",
      "parents_name": "Parent 1",
      "mobile": "+91-9876543213",
      "address": "Address 1",
      "govt_id": "123456789013",
      "govt_id_type": "Aadhaar"
    },
    {
      "name": "Student 2",
      "email": "student2@example.com",
      "parents_name": "Parent 2",
      "mobile": "+91-9876543214",
      "address": "Address 2",
      "govt_id": "123456789014",
      "govt_id_type": "Aadhaar"
    }
  ]
}
*/
