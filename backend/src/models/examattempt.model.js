const mongoose = require('mongoose');

const examAttemptSchema = new mongoose.Schema({
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  batch: String,
  section: String,
  rollNumber: String,
  mcqAnswers: [
    {
      questionId: mongoose.Schema.Types.ObjectId,
      selectedOption: String,
      isCorrect: Boolean,
    },
  ],
  writtenAnswers: [
    {
      questionId: mongoose.Schema.Types.ObjectId,
      answerText: String,
      answerFile: String,
      diagramUrl: String,
    },
  ],
  startTime: Date,
  endTime: Date,
  mcqStartTime: Date,
  mcqEndTime: Date,
  writtenStartTime: Date,
  writtenEndTime: Date,
  totalDuration: Number,
  mcqDuration: Number,
  writtenDuration: Number,
  submitted: {
    type: Boolean,
    default: false,
  },
  submittedAt: Date,
  invigilatorName: String,
  invigilatorId: mongoose.Schema.Types.ObjectId,
  focusLossCount: {
    type: Number,
    default: 0,
  },
  windowSwitchCount: {
    type: Number,
    default: 0,
  },
  tabSwitchCount: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('ExamAttempt', examAttemptSchema);
