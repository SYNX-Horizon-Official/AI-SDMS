const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  examType: {
    type: String,
    enum: ['midterm', 'final', 'test', 'improvement'],
    required: true,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  batch: String,
  section: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  totalMarks: {
    type: Number,
    required: true,
  },
  examDate: Date,
  examStartTime: String,
  examDuration: Number,
  mcqDuration: Number,
  questions: [
    {
      questionNumber: Number,
      questionText: String,
      questionType: {
        type: String,
        enum: ['mcq', 'short', 'long', 'diagram'],
      },
      options: [String],
      marks: Number,
      expectedAnswer: String,
      keywords: [String],
      gradingCriteria: String,
      orderInExam: Number,
    },
  ],
  instructions: String,
  attemptAnyX: {
    enabled: Boolean,
    totalQuestions: Number,
    attemptRequired: Number,
  },
  published: {
    type: Boolean,
    default: false,
  },
  launched: {
    type: Boolean,
    default: false,
  },
  launchedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Exam', examSchema);
