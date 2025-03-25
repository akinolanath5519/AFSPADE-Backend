// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');  // Assuming the User model is in the 'models' folder

// JWT secret key (it should match the one used in the `generateToken` function)
const JWT_SECRET = "your_hardcoded_jwt_secret"; // Replace with your strong key


const authenticateUser = async (req, res, next) => {
  // Check if the token is provided in the Authorization header
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Verify the token using the secret
    const decoded = jwt.verify(token, JWT_SECRET); // Replace with your actual JWT secret

    // Find the user based on the decoded ID
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Attach the user information to the request object
    req.user = user;
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    // Add more detailed error messages for debugging
    console.error("JWT verification error:", error);
    res.status(401).json({ message: 'Invalid token' });
  }
};


// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next(); // Proceed to the next middleware or route handler
};



// Middleware to check if the user is a lecturer
const isLecturer = (req, res, next) => {
  if (req.user.role !== 'lecturer') {
    return res.status(403).json({ message: "Access denied. Lecturers only." });
  }
  next(); // Proceed to the next middleware or route handler
};

module.exports = {
  authenticateUser,
  isAdmin,
  isLecturer
};
