const User = require('../models/User');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const nodemailer = require('nodemailer');



async function createAssignment(req, res) {
    try {
        const { title, description, dueDate, course } = req.body;
        const lecturerId = req.user._id;

        // Find the course and lecturer
        const courseDoc = await Course.findById(course);
        const lecturerDoc = await User.findById(lecturerId);

        if (!courseDoc || !lecturerDoc) {
            return res.status(404).json({ message: 'Course or Lecturer not found' });
        }

        // Create the new assignment
        const newAssignment = new Assignment({
            title,
            description,
            dueDate,
            course,
            lecturer: lecturerId,
            status: 'open',
        });

        await newAssignment.save();
        console.log('Assignment created:', newAssignment);

        // Send email to students
        const students = await User.find({ _id: { $in: courseDoc.students } });  // Find all students in the course
        const emailRecipients = students.map(student => student.email);

        if (emailRecipients.length > 0) {
            const transporter = nodemailer.createTransport({
                service: 'gmail', // Example: use Gmail as the service
                auth: {
                  user: 'akinolanathaniel3026@gmail.com',  // Replace with your email
                  pass: 'palksvguqspncjch',  // Make sure to use environment variables in real apps
                },
            });

            const mailOptions = {
                from: 'your-email@gmail.com',
                to: emailRecipients,
                subject: `New Assignment: ${title}`,
                text: `Dear Student, \n\nA new assignment titled "${title}" has been posted. \n\nDescription: ${description}\nDue Date: ${dueDate}\n\nPlease make sure to submit your work on time.`,
            };

            await transporter.sendMail(mailOptions);
            console.log('Emails sent to students:', emailRecipients);
        }

        res.status(201).json({ message: 'Assignment created and emails sent to students', assignment: newAssignment });

    } catch (error) {
        console.error('Error creating assignment:', error);
        res.status(500).json({ message: 'Error creating assignment' });
    }
}



// Get all assignments for a specific course
const getAssignmentsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id; // Extracted from the token
    const userRole = req.user.role ? req.user.role.trim().toLowerCase() : ""; // Normalize role for comparison (trim and lowercase)

    console.log("User Role:", userRole); // Log the user role for debugging

    // Fetch assignments for the given course
    const assignments = await Assignment.find({ course: courseId })
      .populate("course", "name description")
      .populate("lecturer", "name email");

    // For lecturers, no additional filtering is needed
    if (userRole === "lecturer") {
      return res.status(200).json(assignments);
    }

    // For students, allow access to the assignments regardless of enrollment
    if (userRole === "student") {
      return res.status(200).json(assignments);
    }

    // If the role is neither "lecturer" nor "student"
    return res.status(403).json({ message: "Access denied: Invalid user role" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch assignments", error });
  }
};


// Get all assignments for a specific lecturer
const getAssignmentsByLecturer = async (req, res) => {
  try {
    const { lecturerId } = req.params;
    const assignments = await Assignment.find({
      lecturer: lecturerId,
    }).populate("course", "name");
    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch assignments", error });
  }
};

// Update assignment status
const updateAssignmentStatus = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { status } = req.body;

    if (!status || !["open", "closed", "graded"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updatedAssignment = await Assignment.findByIdAndUpdate(
      assignmentId,
      { status },
      { new: true }
    );

    if (!updatedAssignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.status(200).json(updatedAssignment);
  } catch (error) {
    res.status(500).json({ message: "Failed to update assignment", error });
  }
};

// Delete an assignment
const deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const deletedAssignment = await Assignment.findByIdAndDelete(assignmentId);

    if (!deletedAssignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.status(200).json({ message: "Assignment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete assignment", error });
  }
};
module.exports = {
  deleteAssignment,
  updateAssignmentStatus,
  getAssignmentsByLecturer,
  getAssignmentsByCourse,
  createAssignment,
};
