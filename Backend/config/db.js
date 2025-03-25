const mongoose = require('mongoose');
const User = require('../models/User');  // Import the User model correctly
const Course = require('../models/Course'); // Import the Course model as well
require('dotenv').config(); // Load .env variables


// Find the lecturer and update the courses
async function addCourseToLecturer(lecturerId, courseId) {
    const lecturer = await User.findById(lecturerId);
    const course = await Course.findById(courseId);
  
    if (!lecturer || !course) {
      console.log("Lecturer or Course not found.");
      return;
    }
  
    // Check if the lecturer is already assigned to the course
    if (!lecturer.courses.includes(course._id)) {
      lecturer.courses.push(course._id);
      await lecturer.save();
      console.log(`Course added to lecturer: ${lecturer.name}`);
    } else {
      console.log('Lecturer is already associated with this course');
    }
  }
  
// Enroll students in the course
async function enrollStudentsInCourse(courseId, studentIds) {
    const course = await Course.findById(courseId);
    if (!course) {
      console.log('Course not found');
      return;
    }
  
    for (let studentId of studentIds) {
      const student = await User.findById(studentId);
      if (!student) {
        console.log(`Student not found with ID: ${studentId}`);
        continue;
      }
  
      if (!course.students.includes(student._id)) {
        course.students.push(student._id);
        student.courses.push(course._id);  // Adding course to the student's courses as well
        await course.save();
        await student.save();
        console.log(`Student ${student.name} enrolled in the course`);
      } else {
        console.log(`Student ${student.name} is already enrolled in this course`);
      }
    }
  }
  
enrollStudentsInCourse();

addCourseToLecturer();


const connectDB = async () => {
  try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
      });
      console.log(`MongoDB Connected successfully`);
  } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
  }
};

module.exports = connectDB;
