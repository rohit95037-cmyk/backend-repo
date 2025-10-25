const express = require("express");
const router = express.Router();
const { verifyToken, isTeacher, isStudent } = require("../middleware/auth");
const { submissions, assignments } = require("../models/data");

// GET /api/submissions - Get submissions (role-based)
router.get("/", verifyToken, (req, res) => {
  try {
    if (req.user.role === "teacher") {
      // Teachers can see all submissions
      const { assignmentId } = req.query;

      if (assignmentId) {
        const filtered = submissions.filter(
          (s) => s.assignmentId === parseInt(assignmentId)
        );
        return res.json({ success: true, submissions: filtered });
      }

      res.json({ success: true, submissions });
    } else {
      // Students can only see their own submissions
      const studentSubmissions = submissions.filter(
        (s) => s.studentId === req.user.id
      );
      res.json({ success: true, submissions: studentSubmissions });
    }
  } catch (error) {
    console.error("Get submissions error:", error);
    res.status(500).json({ error: "Server error fetching submissions" });
  }
});

// GET /api/submissions/assignment/:assignmentId - Get submissions for specific assignment
router.get("/assignment/:assignmentId", verifyToken, isTeacher, (req, res) => {
  try {
    const assignmentId = parseInt(req.params.assignmentId);
    const assignmentSubmissions = submissions.filter(
      (s) => s.assignmentId === assignmentId
    );

    res.json({
      success: true,
      submissions: assignmentSubmissions,
    });
  } catch (error) {
    console.error("Get assignment submissions error:", error);
    res.status(500).json({ error: "Server error fetching submissions" });
  }
});

// GET /api/submissions/my/:assignmentId - Get student's own submission for assignment
router.get("/my/:assignmentId", verifyToken, isStudent, (req, res) => {
  try {
    const assignmentId = parseInt(req.params.assignmentId);
    const submission = submissions.find(
      (s) => s.assignmentId === assignmentId && s.studentId === req.user.id
    );

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    res.json({ success: true, submission });
  } catch (error) {
    console.error("Get student submission error:", error);
    res.status(500).json({ error: "Server error fetching submission" });
  }
});

// POST /api/submissions - Submit assignment (Students only)
router.post("/", verifyToken, isStudent, (req, res) => {
  try {
    const { assignmentId, submittedAnswer, submittedFile } = req.body;

    if (!assignmentId || !submittedAnswer) {
      return res
        .status(400)
        .json({ error: "Assignment ID and answer are required" });
    }

    // Check if assignment exists and is published
    const assignment = assignments.find((a) => a.id === parseInt(assignmentId));
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    if (assignment.status !== "published") {
      return res.status(400).json({ error: "Assignment is not published" });
    }

    // Check if assignment is past due date
    const currentDate = new Date();
    const dueDate = new Date(assignment.dueDate);
    if (currentDate > dueDate) {
      return res.status(400).json({ 
        error: "Assignment submission deadline has passed",
        dueDate: assignment.dueDate,
        currentDate: currentDate.toISOString().split('T')[0]
      });
    }

    // Check if student has already submitted
    const existingSubmission = submissions.find(
      (s) =>
        s.assignmentId === parseInt(assignmentId) && s.studentId === req.user.id
    );

    if (existingSubmission) {
      return res
        .status(400)
        .json({ error: "You have already submitted this assignment" });
    }

    // Create new submission
    const newSubmission = {
      id: submissions.length + 1,
      assignmentId: parseInt(assignmentId),
      studentId: req.user.id,
      studentName: req.user.name || req.user.email.split("@")[0],
      studentEmail: req.user.email,
      submittedAnswer,
      submittedFile: submittedFile || null,
      submittedAt: new Date().toLocaleString(),
      isReviewed: false,
    };

    submissions.push(newSubmission);

    res.status(201).json({
      success: true,
      message: "Assignment submitted successfully",
      submission: newSubmission,
    });
  } catch (error) {
    console.error("Submit assignment error:", error);
    res.status(500).json({ error: "Server error submitting assignment" });
  }
});

// PATCH /api/submissions/:id/review - Mark submission as reviewed (Teachers only)
router.patch("/:id/review", verifyToken, isTeacher, (req, res) => {
  try {
    const submissionIndex = submissions.findIndex(
      (s) => s.id === parseInt(req.params.id)
    );

    if (submissionIndex === -1) {
      return res.status(404).json({ error: "Submission not found" });
    }

    submissions[submissionIndex].isReviewed = true;

    res.json({
      success: true,
      message: "Submission marked as reviewed",
      submission: submissions[submissionIndex],
    });
  } catch (error) {
    console.error("Review submission error:", error);
    res.status(500).json({ error: "Server error reviewing submission" });
  }
});

module.exports = router;
