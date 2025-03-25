const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { authenticateUser, isAdmin, isLecturer } = require('../middleware/authmiddleware');

router.post("/chat", authenticateUser, chatController.uploadMiddleware, chatController.sendMessage);

router.get("/messages", authenticateUser,  chatController.getMessages);
module.exports = router;
