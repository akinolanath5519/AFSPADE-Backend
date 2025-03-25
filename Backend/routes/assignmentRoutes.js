const express = require('express');
const { authenticateUser, isAdmin, isLecturer } = require('../middleware/authmiddleware');


const {
  createAssignment,
  getAssignmentsByCourse,
  getAssignmentsByLecturer,
  updateAssignmentStatus,
  deleteAssignment,
} = require('../controllers/assignmentController');
const router = express.Router();



// Create a new assignment
router.post('/assignment',authenticateUser, createAssignment);

// Get all assignments for a specific course
router.get('/assignment/:courseId',authenticateUser, getAssignmentsByCourse);

// Get all assignments for a specific lecturer
router.get('/assignment/:lecturerId', getAssignmentsByLecturer);

// Update assignment status
router.patch('/:assignmentId/status', updateAssignmentStatus);

// Delete an assignment
router.delete('/:assignmentId', deleteAssignment);

module.exports = router;
