const express = require("express");
const router = express.Router();
const { verifyToken, isTeacher } = require("../middleware/auth");
const { assignments, submissions } = require("../models/data");

// GET /api/assignments - Get all assignments (role-based)
router.get("/", verifyToken, (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let filteredAssignments;
    if (req.user.role === "teacher") {
      // Teachers can see all their assignments
      filteredAssignments = assignments;
    } else {
      // Students can only see published assignments
      filteredAssignments = assignments.filter(
        (a) => a.status === "published"
      );
    }

    // Apply pagination
    const paginatedAssignments = filteredAssignments.slice(offset, offset + limit);
    const totalAssignments = filteredAssignments.length;
    const totalPages = Math.ceil(totalAssignments / limit);

    res.json({ 
      success: true, 
      assignments: paginatedAssignments,
      pagination: {
        currentPage: page,
        totalPages,
        totalAssignments,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error("Get assignments error:", error);
    res.status(500).json({ error: "Server error fetching assignments" });
  }
});

// GET /api/assignments/:id - Get single assignment
router.get("/:id", verifyToken, (req, res) => {
  try {
    const assignment = assignments.find(
      (a) => a.id === parseInt(req.params.id)
    );

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    // Students can only see published assignments
    if (req.user.role === "student" && assignment.status !== "published") {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json({ success: true, assignment });
  } catch (error) {
    console.error("Get assignment error:", error);
    res.status(500).json({ error: "Server error fetching assignment" });
  }
});

// POST /api/assignments - Create new assignment (Teachers only)
router.post("/", verifyToken, isTeacher, (req, res) => {
  try {
    const { title, description, dueDate } = req.body;

    if (!title || !description || !dueDate) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newAssignment = {
      id: assignments.length + 1,
      title,
      description,
      dueDate,
      status: "draft",
      createdAt: new Date().toISOString().split("T")[0],
      teacherId: req.user.id,
    };

    assignments.push(newAssignment);

    res.status(201).json({
      success: true,
      message: "Assignment created successfully",
      assignment: newAssignment,
    });
  } catch (error) {
    console.error("Create assignment error:", error);
    res.status(500).json({ error: "Server error creating assignment" });
  }
});

// PUT /api/assignments/:id - Update assignment (Teachers only)
router.put("/:id", verifyToken, isTeacher, (req, res) => {
  try {
    const assignmentIndex = assignments.findIndex(
      (a) => a.id === parseInt(req.params.id)
    );

    if (assignmentIndex === -1) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    const assignment = assignments[assignmentIndex];

    // Only draft assignments can be fully edited
    if (assignment.status !== "draft") {
      return res
        .status(400)
        .json({ error: "Only draft assignments can be edited" });
    }

    const { title, description, dueDate } = req.body;

    assignments[assignmentIndex] = {
      ...assignment,
      title: title || assignment.title,
      description: description || assignment.description,
      dueDate: dueDate || assignment.dueDate,
    };

    res.json({
      success: true,
      message: "Assignment updated successfully",
      assignment: assignments[assignmentIndex],
    });
  } catch (error) {
    console.error("Update assignment error:", error);
    res.status(500).json({ error: "Server error updating assignment" });
  }
});

// PATCH /api/assignments/:id/status - Change assignment status (Teachers only)
router.patch("/:id/status", verifyToken, isTeacher, (req, res) => {
  try {
    const assignmentIndex = assignments.findIndex(
      (a) => a.id === parseInt(req.params.id)
    );

    if (assignmentIndex === -1) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    const assignment = assignments[assignmentIndex];
    const { status } = req.body;

    // Validate status transitions
    const validTransitions = {
      draft: ["published"],
      published: ["completed"],
      completed: [],
    };

    if (!validTransitions[assignment.status].includes(status)) {
      return res.status(400).json({ error: "Invalid status transition" });
    }

    assignments[assignmentIndex].status = status;

    res.json({
      success: true,
      message: "Assignment status updated successfully",
      assignment: assignments[assignmentIndex],
    });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ error: "Server error updating status" });
  }
});

// DELETE /api/assignments/:id - Delete assignment (Teachers only, draft only)
router.delete("/:id", verifyToken, isTeacher, (req, res) => {
  try {
    const assignmentIndex = assignments.findIndex(
      (a) => a.id === parseInt(req.params.id)
    );

    if (assignmentIndex === -1) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    const assignment = assignments[assignmentIndex];

    // Only draft assignments can be deleted
    if (assignment.status !== "draft") {
      return res
        .status(400)
        .json({ error: "Only draft assignments can be deleted" });
    }

    assignments.splice(assignmentIndex, 1);

    res.json({
      success: true,
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    console.error("Delete assignment error:", error);
    res.status(500).json({ error: "Server error deleting assignment" });
  }
});

// GET /api/assignments/analytics/dashboard - Get dashboard analytics (Teachers only)
router.get("/analytics/dashboard", verifyToken, isTeacher, (req, res) => {
  try {
    const teacherAssignments = assignments.filter(a => a.teacherId === req.user.id);
    
    const analytics = {
      totalAssignments: teacherAssignments.length,
      assignmentsByStatus: {
        draft: teacherAssignments.filter(a => a.status === 'draft').length,
        published: teacherAssignments.filter(a => a.status === 'published').length,
        completed: teacherAssignments.filter(a => a.status === 'completed').length
      },
      submissionStats: teacherAssignments.map(assignment => {
        const assignmentSubmissions = submissions.filter(s => s.assignmentId === assignment.id);
        const reviewedSubmissions = assignmentSubmissions.filter(s => s.isReviewed);
        
        return {
          assignmentId: assignment.id,
          assignmentTitle: assignment.title,
          totalSubmissions: assignmentSubmissions.length,
          reviewedSubmissions: reviewedSubmissions.length,
          pendingReview: assignmentSubmissions.length - reviewedSubmissions.length,
          submissionRate: teacherAssignments.length > 0 ? 
            ((assignmentSubmissions.length / teacherAssignments.length) * 100).toFixed(1) : 0
        };
      }),
      recentActivity: {
        recentAssignments: teacherAssignments
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map(a => ({
            id: a.id,
            title: a.title,
            status: a.status,
            createdAt: a.createdAt,
            dueDate: a.dueDate
          })),
        recentSubmissions: submissions
          .filter(s => teacherAssignments.some(a => a.id === s.assignmentId))
          .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
          .slice(0, 5)
          .map(s => ({
            id: s.id,
            assignmentTitle: teacherAssignments.find(a => a.id === s.assignmentId)?.title,
            studentName: s.studentName,
            submittedAt: s.submittedAt,
            isReviewed: s.isReviewed
          }))
      }
    };

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json({ error: "Server error fetching analytics" });
  }
});

module.exports = router;
