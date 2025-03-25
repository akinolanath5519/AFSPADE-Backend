const axios = require("axios");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const ChatMessage = require("../models/ChatMessage");
const Assignment = require("../models/Assignment");
require("dotenv").config();

// ----------------- Multer Configuration ----------------- //
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");
    
    // Ensure the directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Export this middleware to use in your route
exports.uploadMiddleware = upload.single("assignmentFile");

// ----------------- sendMessage Controller ----------------- //
exports.sendMessage = async (req, res) => {
  try {
    console.log("📩 Received Request Body:", req.body); // Debugging log
    // Get student ID from the authenticated user
    const student = req.user?._id;
    if (!student) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized. Student not logged in.",
      });
    }

    // Extract assignmentId from request body
    const { assignmentId } = req.body;
    if (!assignmentId) {
      return res.status(400).json({
        success: false,
        error: "assignmentId is required",
      });
    }

    // Determine studentCode: use file content if a file was uploaded; otherwise, use studentCode from req.body
    let studentCode = "";
    if (req.file) {
      studentCode = fs.readFileSync(req.file.path, "utf-8");
      // Optionally, delete the file after reading its content
      fs.unlinkSync(req.file.path);
    } else if (req.body.studentCode) {
      studentCode = req.body.studentCode;
    } else {
      return res.status(400).json({
        success: false,
        error: "No student code provided. Upload a file or provide code in the request body.",
      });
    }

    // Fetch assignment instructions from the database
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, error: "Assignment not found." });
    }
    if (!assignment.description) {
      return res.status(400).json({ success: false, error: "Assignment description is missing." });
    }

    // Build the AI grading prompt by merging detailed evaluation criteria with assignment instructions and student submission
    const gradingPrompt = `
You are an AI programming instructor grading a student's assignment. Your goal is to provide **clear, constructive, and structured** feedback.

### 📌 Evaluation Criteria:
1️⃣ **Error Analysis** (if any)  
   - Identify and explain syntax, logical, or runtime errors.  
   - Provide corrected code snippets with explanations.  

2️⃣ **Code Quality & Best Practices**  
   - Assess readability, maintainability, proper naming conventions, and modularity.  
   - Identify unused variables, redundant code, or poor structure.  

3️⃣ **Optimization & Efficiency**  
   - Evaluate whether the code follows optimal time and space complexity.  
   - Suggest improvements for better performance.  

4️⃣ **Completeness & Requirement Fulfillment**  
   - Check if the code fully meets the assignment requirements.  
   - Identify missing functionality or incorrect implementation.  

5️⃣ **Final Grade (out of 100) - Provide a Breakdown**  
   - ✅ **Correctness (40%)** – Does the solution work as expected?  
   - ⚡ **Efficiency (20%)** – Is it optimized for performance?  
   - 📖 **Readability (20%)** – Is the code well-structured and commented?  
   - 🔍 **Completeness (20%)** – Does the code fully satisfy requirements?  

Ensure that you provide scores using the exact format:
Correctness: X/40  
Efficiency: X/20  
Readability: X/20  
Completeness: X/20

---
### 📜 **Assignment Instructions:**  
${assignment.description}  

### 📝 **Student Submission:**  
\`\`\`
${studentCode}
\`\`\`

Provide detailed feedback based on the above structure.
`;

    // Call the AI service to analyze the code
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "nvidia/llama-3.1-nemotron-70b-instruct:free",
        messages: [{ role: "user", content: gradingPrompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_NIVIDIA_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const aiFeedback =
      response.data.choices?.[0]?.message?.content || "No response received.";
    console.log("🔍 AI Feedback Received:", aiFeedback);

    // Helper function to extract scores from the AI feedback using regex
    const extractScore = (label, maxScore) => {
      const regex = new RegExp(`${label}\\D*(\\d{1,3})\\s*/\\s*${maxScore}`, "i");
      const match = aiFeedback.match(regex);
      return match ? parseInt(match[1], 10) : 0;
    };

    const scores = {
      correctness: extractScore("Correctness", 40),
      efficiency: extractScore("Efficiency", 20),
      readability: extractScore("Readability", 20),
      completeness: extractScore("Completeness", 20),
      total:
        extractScore("Correctness", 40) +
        extractScore("Efficiency", 20) +
        extractScore("Readability", 20) +
        extractScore("Completeness", 20),
    };

    // Save the submission in the database, including assignment instructions from the assignment's description
    const chatMessage = new ChatMessage({
      student,
      studentCode,
      assignmentId,
      assignmentInstructions: assignment.description,
      aiFeedback,
      scores,
    });

    await chatMessage.save();

    res.status(200).json({
      success: true,
      result: { student, feedback: aiFeedback, scores },
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to grade the assignment.",
    });
  }
};

// ----------------- getMessages Controller ----------------- //
exports.getMessages = async (req, res) => {
  try {
    // Ensure the student is authenticated
    const student = req.user?._id;  // Assuming the student ID is stored in req.user after authentication
    if (!student) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized. Student not logged in.",
      });
    }

    // Define the query to find messages for the authenticated student
    const query = { student };

    // Fetch the messages from the database sorted by creation date
    const messages = await ChatMessage.find(query).sort({ createdAt: -1 });

    if (!messages || messages.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No messages found for the given student.",
      });
    }

    // Respond with the fetched messages
    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve messages.",
    });
  }
};