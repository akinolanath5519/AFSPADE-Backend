const jwt = require('jsonwebtoken');
const Course = require('../models/Course'); // Assuming you have a course model
const User = require('../models/User'); // Assuming you have a user model


const JWT_SECRET = "your_hardcoded_jwt_secret";
// Controller for creating a course
const createCourseWithLecturer = async (req, res) => {
    try {
      const { name, description } = req.body;  // Change 'title' to 'name'
  
      // Validate input data
      if (!name || !description) {
        return res.status(400).json({ message: 'Name and description are required.' });
      }
  
      // Create the new course
      const newCourse = new Course({
        name,         // Use 'name' here
        description,
        lecturer: req.user._id, // Lecturer is the authenticated user
        students: [], // Initially no students enrolled
      });
  
      // Save the course to the database
      const savedCourse = await newCourse.save();
  
      return res.status(201).json({
        message: 'Course created successfully',
        course: savedCourse,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error, try again later.' });
    }
  };
  

//Controller for students to fetch all courses
const getAllCoursesForStudents = async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        // Fetch the user from the database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Verify the user is a student
        if (user.role !== 'student') {
            return res.status(403).json({ message: 'Access denied. Only students can view all courses.' });
        }

        // Fetch all courses
        const courses = await Course.find({});
        return res.status(200).json({ courses });
    } catch (error) {
        console.error('Error fetching courses for students:', error);
        return res.status(500).json({ message: 'Server error, try again later.' });
    }
};



// Controller for selecting a course for a student
const selectCourseForStudent = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id; // Student is the authenticated user

    // Find the course by its ID
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    // Ensure the student is not already enrolled in the course
    if (course.students.includes(studentId)) {
      return res.status(400).json({ message: 'You are already enrolled in this course.' });
    }

    // Add the student to the course
    course.students.push(studentId);
    await course.save();

    return res.status(200).json({
      message: 'you have enrolled in this course successfully',
      course,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error, try again later.' });
  }
};

// Controller for getting all courses
const getAllCourses = async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        console.log('Decoded User ID:', userId); // Log the userId

        const courses = await Course.find({ lecturer: userId });
        console.log('Courses fetched:', courses); // Log the result of the query

        return res.status(200).json({ courses });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error, try again later.' });
    }
};


const mongoose = require('mongoose'); // Ensure mongoose is imported

// Controller for getting a single course by ID
const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    // Log the received ID for debugging
    console.log(`Received ID: ${id}`);

    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error(`Invalid ID format: ${id}`);
      return res.status(400).json({ message: 'Invalid course ID format.' });
    }

    // Find the course by its ID
    const course = await Course.findById(id);
    if (!course) {
      console.error(`Course not found for ID: ${id}`);
      return res.status(404).json({ message: 'Course not found.' });
    }

    return res.status(200).json({ course });
  } catch (error) {
    console.error(`Error fetching course by ID: ${error.message}`);
    return res.status(500).json({ message: 'Server error, try again later.' });
  }
};




// Controller for updating a course
const updateCourse = async (req, res) => {
  try {
    const { title, description } = req.body;
    const { courseId } = req.params;

    // Validate input data
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required.' });
    }

    // Find and update the course
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { title, description },
      { new: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    return res.status(200).json({
      message: 'Course updated successfully',
      course: updatedCourse,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error, try again later.' });
  }
};

// Controller for deleting a course
const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Find and delete the course
    const deletedCourse = await Course.findByIdAndDelete(courseId);

    if (!deletedCourse) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    return res.status(200).json({
      message: 'Course deleted successfully',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error, try again later.' });
  }
};

module.exports = {
  createCourseWithLecturer,
  selectCourseForStudent,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getAllCoursesForStudents
};

