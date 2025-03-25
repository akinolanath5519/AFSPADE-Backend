const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// JWT secret key
const JWT_SECRET = "your_hardcoded_jwt_secret";

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "30d" }); // 'your_jwt_secret' should be the same everywhere
};


// Register Student
const registerStudent = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Student already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new student
    const student = await User.create({
      name, 
      email,
      password: hashedPassword,
      role: "student",
    });

    if (student) {
      res.status(201).json({
        _id: student.id,
        name: student.name,
        email: student.email,
        role: student.role,
        token: generateToken(student.id),
      });
    } else {
      res.status(400).json({ message: "Invalid student data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Register Lecturer
const registerLecturer = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Lecturer already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new lecturer
    const lecturer = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "lecturer",
    });

    if (lecturer) {
      res.status(201).json({
        _id: lecturer.id,
        name: lecturer.name,
        email: lecturer.email,
        role: lecturer.role,
        token: generateToken(lecturer.id),
      });
    } else {
      res.status(400).json({ message: "Invalid lecturer data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Register Admin
const registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new admin
    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    if (admin) {
      res.status(201).json({
        _id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        token: generateToken(admin.id),
      });
    } else {
      res.status(400).json({ message: "Invalid admin data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get User Profile (Placeholder)
const getUserProfile = async (req, res) => {
  res.json({ message: "User profile data" });
};

module.exports = {
  registerStudent,
  registerLecturer,
  registerAdmin,
  loginUser,
  getUserProfile,

};

