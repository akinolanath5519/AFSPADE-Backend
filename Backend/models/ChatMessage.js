const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Links each message to a single student
      required: true,
    },
    studentCode: { type: String, required: true },
    assignmentInstructions: { type: String, required: true },
    aiFeedback: { type: String, required: true },
    scores: {
      correctness: { type: Number, required: true },
      efficiency: { type: Number, required: true },
      readability: { type: Number, required: true },
      completeness: { type: Number, required: true },
      total: { type: Number, required: true },
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);
module.exports = ChatMessage;
