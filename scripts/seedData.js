const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

const Node = require('../models/node.model');
const User = require('../models/user.model');
const Program = require('../models/program.model');
const Course = require('../models/course.model');
const NodeAssignment = require('../models/nodeAssignment.model');
const FacultyAssignment = require('../models/facultyAssignment.model');
const Enrollment = require('../models/enrollment.model');
const Attendance = require('../models/attendance.model');
const Credit = require('../models/credit.model');
const Certificate = require('../models/certificate.model');
const Progress = require('../models/progress.model');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data (optional - uncomment if you want to reset)
    await Node.deleteMany({});
    await User.deleteMany({});
    await Program.deleteMany({});
    await Course.deleteMany({});
    await NodeAssignment.deleteMany({});
    await FacultyAssignment.deleteMany({});
    await Enrollment.deleteMany({});
    await Attendance.deleteMany({});
    await Credit.deleteMany({});
    await Certificate.deleteMany({});
    await Progress.deleteMany({});
    console.log('Cleared existing data');

    // Create sample nodes
    const nodes = await Node.create([
      {
        node_name: 'Delhi Central Node',
        state_name: 'Delhi',
        node_coordinates: '28.6139° N, 77.2090° E'
      },
      {
        node_name: 'Mumbai West Node',
        state_name: 'Maharashtra',
        node_coordinates: '19.0760° N, 72.8777° E'
      },
      {
        node_name: 'Bangalore Tech Node',
        state_name: 'Karnataka',
        node_coordinates: '12.9716° N, 77.5946° E'
      }
    ]);

    console.log('Created nodes:', nodes.map(n => n.node_name));

    // Create nodal officers for each node
    const nodalOfficers = await User.create([
      {
        node_id: nodes[0]._id,
        name: 'Dr. Rajesh Kumar',
        email: 'rajesh.kumar@example.com',
        password_hash: 'password123', // Will be hashed by pre-save middleware
        role: 'nodal_officer'
      },
      {
        node_id: nodes[1]._id,
        name: 'Dr. Priya Sharma',
        email: 'priya.sharma@example.com',
        password_hash: 'password123', // Will be hashed by pre-save middleware
        role: 'nodal_officer'
      },
      {
        node_id: nodes[2]._id,
        name: 'Dr. Arjun Patel',
        email: 'arjun.patel@example.com',
        password_hash: 'password123', // Will be hashed by pre-save middleware
        role: 'nodal_officer'
      }
    ]);

    // Update nodes with their nodal officers
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].nodal_officer = nodalOfficers[i]._id;
      await nodes[i].save();
    }

    console.log('Created nodal officers:');
    nodalOfficers.forEach(officer => {
      console.log(`- ${officer.name} (${officer.email})`);
    });

    // Create admin users for each node
    const admins = await User.create([
      {
        node_id: nodes[0]._id,
        name: 'Admin Delhi',
        email: 'admin.delhi@example.com',
        password_hash: 'password123', // Will be hashed by pre-save middleware
        role: 'admin',
        created_by: nodalOfficers[0]._id
      },
      {
        node_id: nodes[1]._id,
        name: 'Admin Mumbai',
        email: 'admin.mumbai@example.com',
        password_hash: 'password123', // Will be hashed by pre-save middleware
        role: 'admin',
        created_by: nodalOfficers[1]._id
      },
      {
        node_id: nodes[2]._id,
        name: 'Admin Bangalore',
        email: 'admin.bangalore@example.com',
        password_hash: 'password123', // Will be hashed by pre-save middleware
        role: 'admin',
        created_by: nodalOfficers[2]._id
      }
    ]);

    // Create faculty users
    const faculty = await User.create([
      {
        node_id: nodes[0]._id,
        name: 'Dr. Sunita Verma',
        email: 'sunita.verma@example.com',
        password_hash: 'password123', // Will be hashed by pre-save middleware
        role: 'faculty',
        created_by: admins[0]._id
      },
      {
        node_id: nodes[0]._id,
        name: 'Prof. Rajesh Gupta',
        email: 'rajesh.gupta@example.com',
        password_hash: 'password123', // Will be hashed by pre-save middleware
        role: 'faculty',
        created_by: admins[0]._id
      },
      {
        node_id: nodes[1]._id,
        name: 'Dr. Meera Joshi',
        email: 'meera.joshi@example.com',
        password_hash: 'password123', // Will be hashed by pre-save middleware
        role: 'faculty',
        created_by: admins[1]._id
      }
    ]);

    // Create student users
    const students = await User.create([
      {
        node_id: nodes[0]._id,
        name: 'Amit Kumar',
        email: 'amit.kumar@example.com',
        password_hash: 'password123', // Will be hashed by pre-save middleware
        role: 'student',
        created_by: admins[0]._id
      },
      {
        node_id: nodes[0]._id,
        name: 'Priya Singh',
        email: 'priya.singh@example.com',
        password_hash: 'password123', // Will be hashed by pre-save middleware
        role: 'student',
        created_by: admins[0]._id
      },
      {
        node_id: nodes[1]._id,
        name: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        password_hash: 'password123', // Will be hashed by pre-save middleware
        role: 'student',
        created_by: admins[1]._id
      },
      {
        node_id: nodes[2]._id,
        name: 'Sneha Patel',
        email: 'sneha.patel@example.com',
        password_hash: 'password123', // Will be hashed by pre-save middleware
        role: 'student',
        created_by: admins[2]._id
      }
    ]);

    // Create programs
    const programs = await Program.create([
      {
        node_id: nodes[0]._id,
        program_name: 'Computer Science Engineering',
        created_by: nodalOfficers[0]._id
      },
      {
        node_id: nodes[0]._id,
        program_name: 'Data Science & Analytics',
        created_by: nodalOfficers[0]._id
      },
      {
        node_id: nodes[1]._id,
        program_name: 'Information Technology',
        created_by: nodalOfficers[1]._id
      },
      {
        node_id: nodes[2]._id,
        program_name: 'Artificial Intelligence',
        created_by: nodalOfficers[2]._id
      }
    ]);

    // Create courses
    const courses = await Course.create([
      {
        program_id: programs[0]._id,
        course_name: 'Introduction to Programming',
        description: 'Basic programming concepts and algorithms',
        start_date: new Date('2024-01-15'),
        end_date: new Date('2024-04-15'),
        status: 'active',
        created_by: admins[0]._id
      },
      {
        program_id: programs[0]._id,
        course_name: 'Data Structures and Algorithms',
        description: 'Advanced data structures and algorithm design',
        start_date: new Date('2024-02-01'),
        end_date: new Date('2024-05-01'),
        status: 'active',
        created_by: admins[0]._id
      },
      {
        program_id: programs[1]._id,
        course_name: 'Machine Learning Fundamentals',
        description: 'Introduction to machine learning concepts',
        start_date: new Date('2024-01-20'),
        end_date: new Date('2024-04-20'),
        status: 'active',
        created_by: admins[0]._id
      },
      {
        program_id: programs[2]._id,
        course_name: 'Web Development',
        description: 'Full-stack web development course',
        start_date: new Date('2024-02-15'),
        end_date: new Date('2024-05-15'),
        status: 'active',
        created_by: admins[1]._id
      }
    ]);

    // Create faculty assignments
    await FacultyAssignment.create([
      {
        course_id: courses[0]._id,
        faculty_id: faculty[0]._id
      },
      {
        course_id: courses[1]._id,
        faculty_id: faculty[1]._id
      },
      {
        course_id: courses[2]._id,
        faculty_id: faculty[0]._id
      },
      {
        course_id: courses[3]._id,
        faculty_id: faculty[2]._id
      }
    ]);

    // Create enrollments
    await Enrollment.create([
      {
        course_id: courses[0]._id,
        student_id: students[0]._id
      },
      {
        course_id: courses[0]._id,
        student_id: students[1]._id
      },
      {
        course_id: courses[1]._id,
        student_id: students[0]._id
      },
      {
        course_id: courses[2]._id,
        student_id: students[1]._id
      },
      {
        course_id: courses[3]._id,
        student_id: students[2]._id
      }
    ]);

    // Create sample attendance records
    const attendanceDates = [
      new Date('2024-01-20'),
      new Date('2024-01-25'),
      new Date('2024-01-30')
    ];

    for (const date of attendanceDates) {
      await Attendance.create([
        {
          course_id: courses[0]._id,
          student_id: students[0]._id,
          date: date,
          status: 'present',
          marked_by: faculty[0]._id
        },
        {
          course_id: courses[0]._id,
          student_id: students[1]._id,
          date: date,
          status: 'present',
          marked_by: faculty[0]._id
        }
      ]);
    }

    // Create sample credits
    await Credit.create([
      {
        course_id: courses[0]._id,
        student_id: students[0]._id,
        credits_earned: 3.0,
        awarded_by: faculty[0]._id
      },
      {
        course_id: courses[0]._id,
        student_id: students[1]._id,
        credits_earned: 3.0,
        awarded_by: faculty[0]._id
      }
    ]);

    // Issue sample certificates
    await Certificate.create([
      {
        course_id: courses[0]._id,
        student_id: students[0]._id,
        issued_date: new Date('2024-04-16'),
        certificate_url: 'https://example.com/certificates/intro-prog-amit.pdf'
      },
      {
        course_id: courses[0]._id,
        student_id: students[1]._id,
        issued_date: new Date('2024-04-16'),
        certificate_url: 'https://example.com/certificates/intro-prog-priya.pdf'
      }
    ]);

    // Compute and persist progress based on attendance and credits
    const computeProgress = async (studentId, courseId) => {
      const records = await Attendance.find({ course_id: courseId, student_id: studentId });
      const total = records.length;
      const present = records.filter(r => r.status === 'present').length;
      const attendancePct = total === 0 ? 0 : (present / total) * 100;

      const credits = await Credit.find({ course_id: courseId, student_id: studentId });
      const creditsSum = credits.reduce((sum, c) => sum + parseFloat(c.credits_earned.toString()), 0);

      await Progress.findOneAndUpdate(
        { student_id: studentId, course_id: courseId },
        { $set: { attendance_pct: attendancePct, credits_earned: creditsSum } },
        { upsert: true }
      );
    };

    await computeProgress(students[0]._id, courses[0]._id);
    await computeProgress(students[1]._id, courses[0]._id);

    console.log('\n🎉 Comprehensive seed data created successfully!');
    console.log('\nLogin credentials for testing:');
    console.log('\n=== NODAL OFFICERS ===');
    console.log('Email: rajesh.kumar@example.com | Password: password123');
    console.log('Email: priya.sharma@example.com | Password: password123');
    console.log('Email: arjun.patel@example.com | Password: password123');
    
    console.log('\n=== ADMINS ===');
    console.log('Email: admin.delhi@example.com | Password: password123');
    console.log('Email: admin.mumbai@example.com | Password: password123');
    console.log('Email: admin.bangalore@example.com | Password: password123');
    
    console.log('\n=== FACULTY ===');
    console.log('Email: sunita.verma@example.com | Password: password123');
    console.log('Email: rajesh.gupta@example.com | Password: password123');
    console.log('Email: meera.joshi@example.com | Password: password123');
    
    console.log('\n=== STUDENTS ===');
    console.log('Email: amit.kumar@example.com | Password: password123');
    console.log('Email: priya.singh@example.com | Password: password123');
    console.log('Email: rahul.sharma@example.com | Password: password123');
    console.log('Email: sneha.patel@example.com | Password: password123');
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
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

// 1. Login as Nodal Officer
/*
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "rajesh.kumar@example.com",
  "password": "password123"
}

Response:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f5a1b2c3d4e5f6g7h8i9j0",
    "name": "Dr. Rajesh Kumar",
    "email": "rajesh.kumar@example.com",
    "role": "nodal_officer",
    "node": {
      "node_name": "Delhi Central Node",
      "state_name": "Delhi"
    }
  }
}
*/

// 2. Create Admin (as Nodal Officer)
/*
POST http://localhost:3000/api/auth/create-user
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "admin"
}
*/

// 3. Get User Profile
/*
GET http://localhost:3000/api/auth/profile
Authorization: Bearer YOUR_JWT_TOKEN
*/

// 4. Get Users (as Nodal Officer or Admin)
/*
GET http://localhost:3000/api/auth/users
Authorization: Bearer YOUR_JWT_TOKEN
*/

// 5. Create Program (as Nodal Officer or Admin)
/*
POST http://localhost:3000/api/auth/programs
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "program_name": "Computer Science Engineering"
}

Response:
{
  "message": "Program created successfully",
  "program": {
    "id": "64f5a1b2c3d4e5f6g7h8i9j1",
    "program_name": "Computer Science Engineering",
    "node_id": "64f5a1b2c3d4e5f6g7h8i9j0"
  }
}
*/

// 6. Get Programs (as any authenticated user)
/*
GET http://localhost:3000/api/auth/programs
Authorization: Bearer YOUR_JWT_TOKEN

Response:
{
  "programs": [
    {
      "_id": "64f5a1b2c3d4e5f6g7h8i9j1",
      "program_name": "Computer Science Engineering",
      "node_id": "64f5a1b2c3d4e5f6g7h8i9j0",
      "created_by": {
        "_id": "64f5a1b2c3d4e5f6g7h8i9j2",
        "name": "Dr. Rajesh Kumar",
        "email": "rajesh.kumar@example.com",
        "role": "nodal_officer"
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
*/

// 7. Create Course (as Nodal Officer or Admin)
/*
POST http://localhost:3000/api/auth/courses
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "program_id": "64f5a1b2c3d4e5f6g7h8i9j1",
  "course_name": "Introduction to Programming",
  "description": "Basic programming concepts and algorithms",
  "start_date": "2024-01-15",
  "end_date": "2024-04-15"
}

Response:
{
  "message": "Course created successfully",
  "course": {
    "id": "64f5a1b2c3d4e5f6g7h8i9j3",
    "course_name": "Introduction to Programming",
    "program_id": "64f5a1b2c3d4e5f6g7h8i9j1",
    "start_date": "2024-01-15T00:00:00.000Z",
    "end_date": "2024-04-15T00:00:00.000Z",
    "status": "draft"
  }
}
*/

// 8. Get Courses (as any authenticated user)
/*
GET http://localhost:3000/api/auth/courses
Authorization: Bearer YOUR_JWT_TOKEN

// Optional: Filter by program
GET http://localhost:3000/api/auth/courses?program_id=64f5a1b2c3d4e5f6g7h8i9j1
Authorization: Bearer YOUR_JWT_TOKEN

Response:
{
  "courses": [
    {
      "_id": "64f5a1b2c3d4e5f6g7h8i9j3",
      "course_name": "Introduction to Programming",
      "description": "Basic programming concepts and algorithms",
      "start_date": "2024-01-15T00:00:00.000Z",
      "end_date": "2024-04-15T00:00:00.000Z",
      "status": "active",
      "program_id": {
        "_id": "64f5a1b2c3d4e5f6g7h8i9j1",
        "program_name": "Computer Science Engineering",
        "node_id": "64f5a1b2c3d4e5f6g7h8i9j0"
      },
      "created_by": {
        "_id": "64f5a1b2c3d4e5f6g7h8i9j4",
        "name": "Admin Delhi",
        "email": "admin.delhi@example.com",
        "role": "admin"
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
*/

// 9. Enroll Student in Course (as Nodal Officer or Admin)
/*
POST http://localhost:3000/api/auth/enroll
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "course_id": "64f5a1b2c3d4e5f6g7h8i9j3",
  "student_id": "64f5a1b2c3d4e5f6g7h8i9j5"
}

Response:
{
  "message": "Student enrolled successfully",
  "enrollment": {
    "id": "64f5a1b2c3d4e5f6g7h8i9j6",
    "course_id": "64f5a1b2c3d4e5f6g7h8i9j3",
    "student_id": "64f5a1b2c3d4e5f6g7h8i9j5"
  }
}
*/

// 10. Create Faculty Assignment (Manual - requires direct database access)
/*
Note: Faculty assignments are created through the database directly in seed data.
To create via API, you would need to add an endpoint like:

POST http://localhost:3000/api/auth/assign-faculty
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "course_id": "64f5a1b2c3d4e5f6g7h8i9j3",
  "faculty_id": "64f5a1b2c3d4e5f6g7h8i9j7"
}
*/

// 11. Mark Attendance (Faculty/Admin/Nodal)
/*
POST http://localhost:3000/api/auth/attendance
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "course_id": "[COURSE_ID]",
  "student_id": "[STUDENT_ID]",
  "date": "2024-01-20",
  "status": "present" // one of: present, absent, late, excused
}

Response:
{
  "message": "Attendance recorded",
  "attendance": {
    "_id": "...",
    "course_id": "...",
    "student_id": "...",
    "date": "2024-01-20T00:00:00.000Z",
    "status": "present",
    "marked_by": "..."
  }
}
*/

// 12. Award Credits (Manual - requires direct database access)
/*
Note: Credit awarding would require a new endpoint like:

POST http://localhost:3000/api/auth/credits
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "course_id": "64f5a1b2c3d4e5f6g7h8i9j3",
  "student_id": "64f5a1b2c3d4e5f6g7h8i9j5",
  "credits_earned": 3.0
}
*/

// 13. Generate Certificate (Manual - requires direct database access)
/*
Note: Certificate generation would require a new endpoint like:

POST http://localhost:3000/api/auth/certificates
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "course_id": "64f5a1b2c3d4e5f6g7h8i9j3",
  "student_id": "64f5a1b2c3d4e5f6g7h8i9j5",
  "certificate_url": "https://example.com/certificates/abc123.pdf"
}
*/

// 14. Get Student Progress
/*
// Students can omit student_id to see their own; staff must provide student_id

GET http://localhost:3000/api/auth/progress?student_id=[STUDENT_ID]
Authorization: Bearer YOUR_JWT_TOKEN

// Optional: single course
GET http://localhost:3000/api/auth/progress?student_id=[STUDENT_ID]&course_id=[COURSE_ID]

Response:
{
  "progress": [
    {
      "_id": "...",
      "student_id": "...",
      "course_id": "...",
      "attendance_pct": 100,
      "credits_earned": 3,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
*/

// ========================================
// COMPLETE TESTING WORKFLOW
// ========================================

/*
1. LOGIN AS NODAL OFFICER
POST http://localhost:3000/api/auth/login
{
  "email": "rajesh.kumar@example.com",
  "password": "password123"
}

2. CREATE A PROGRAM
POST http://localhost:3000/api/auth/programs
Authorization: Bearer [TOKEN_FROM_STEP_1]
{
  "program_name": "Advanced Computer Science"
}

3. GET PROGRAMS TO VERIFY
GET http://localhost:3000/api/auth/programs
Authorization: Bearer [TOKEN_FROM_STEP_1]

4. CREATE A COURSE
POST http://localhost:3000/api/auth/courses
Authorization: Bearer [TOKEN_FROM_STEP_1]
{
  "program_id": "[PROGRAM_ID_FROM_STEP_2]",
  "course_name": "Advanced Algorithms",
  "description": "Complex algorithm design and analysis",
  "start_date": "2024-02-01",
  "end_date": "2024-05-01"
}

5. GET COURSES TO VERIFY
GET http://localhost:3000/api/auth/courses
Authorization: Bearer [TOKEN_FROM_STEP_1]

6. ENROLL A STUDENT
POST http://localhost:3000/api/auth/enroll
Authorization: Bearer [TOKEN_FROM_STEP_1]
{
  "course_id": "[COURSE_ID_FROM_STEP_4]",
  "student_id": "[STUDENT_ID_FROM_SEED_DATA]"
}

7. GET USER PROFILE
GET http://localhost:3000/api/auth/profile
Authorization: Bearer [TOKEN_FROM_STEP_1]

8. GET ALL USERS IN NODE
GET http://localhost:3000/api/auth/users
Authorization: Bearer [TOKEN_FROM_STEP_1]
*/