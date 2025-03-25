const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['student', 'lecturer', 'admin'],
      required: true,
    },
    courses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',  // This will link the lecturer or student to the courses
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
