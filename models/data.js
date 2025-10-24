const bcrypt = require("bcryptjs");

// In-memory database (replace with MongoDB/PostgreSQL in production)
const users = [
  {
    id: 1,
    email: "teacher@test.com",
    password: bcrypt.hashSync("teacher123", 10),
    role: "teacher",
    name: "Teacher User",
  },
  {
    id: 2,
    email: "student@test.com",
    password: bcrypt.hashSync("student123", 10),
    role: "student",
    name: "Student User",
  },
];

let assignments = [
  {
    id: 1,
    title: "React Fundamentals",
    description: "Complete the React basics tutorial and submit your project",
    dueDate: "2025-11-01",
    status: "published",
    createdAt: "2025-10-15",
    teacherId: 1,
  },
  {
    id: 2,
    title: "JavaScript ES6 Features",
    description: "Write examples demonstrating ES6 features",
    dueDate: "2025-11-05",
    status: "draft",
    createdAt: "2025-10-20",
    teacherId: 1,
  },
];

let submissions = [
  {
    id: 1,
    assignmentId: 1,
    studentId: 2,
    studentName: "Student User",
    studentEmail: "student@test.com",
    submittedAnswer:
      "I have completed the React fundamentals tutorial and built a simple todo application.",
    submittedFile: "react-project.zip",
    submittedAt: "2025-10-25 14:30",
    isReviewed: false,
  },
];

module.exports = {
  users,
  assignments,
  submissions,
};
