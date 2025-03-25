const express = require("express");
const {
  registerStudent,
  registerLecturer,
  registerAdmin,
  loginUser,
  getUserProfile,
} = require("../controllers/userController");

const router = express.Router();

// Register Routes
router.post("/register/student", registerStudent);
router.post("/register/lecturer", registerLecturer);
router.post("/register/admin", registerAdmin);

// Login Route
router.post("/login", loginUser);

// Profile Route (Placeholder)
router.get("/profile", getUserProfile); 

module.exports = router;
