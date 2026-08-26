const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  answers: [
    {
      questionId: mongoose.Schema.Types.ObjectId,
      studentAnswer: String,
      isCorrect: Boolean,
      marksObtained: Number,
    },
  ],
  totalMarksObtained: {
    type: Number,
    default: 0,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  duration: Number,
  published: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
