// src/routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateUser, isAdmin, isLecturer } = require('../middleware/authmiddleware'); // Import the middleware
const CourseController = require('../controllers/courseController'); // Assuming controller is in 'controllers' folder

// Route to create a course with a lecturer and students (only accessible to lecturers or admins)
router.post('/course', authenticateUser, isLecturer, CourseController.createCourseWithLecturer);

// Route to select a course for a student (with courseId in the URL)
router.post('/select/course/:courseId', authenticateUser, CourseController.selectCourseForStudent);

// Other routes related to courses (apply authentication where needed)
router.get('/course', authenticateUser, CourseController.getAllCourses); // Fetch all courses (accessible to any authenticated user)
// Route for students to fetch all courses
router.get('/student/course', authenticateUser, CourseController.getAllCoursesForStudents);
router.get('/course/:id', authenticateUser, CourseController.getCourseById); // Get course by ID (accessible to any authenticated user)
router.put('/course/:courseId', authenticateUser, isLecturer, CourseController.updateCourse); // Update course (only accessible to lecturers)
router.delete('/course/:courseId', authenticateUser, isLecturer, CourseController.deleteCourse); // Delete course (only accessible to admins)

module.exports = router;