const mongoose = require('mongoose');
const User = require('./User');

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      unique: true,
      match: [/^[A-Z]+-\d{4}-\d{3}$/, 'Invalid Student ID format (e.g., BSIT-2023-009)'],
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required'],
    },
    cnic: {
      type: String,
      match: [/^\d{5}-\d{7}-\d$/, 'Invalid CNIC format'],
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
    },
    semester: {
      type: Number,
      min: 1,
      max: 8,
    },
    idCardPicture: String,
    documents: [
      {
        name: String,
        url: String,
        uploadedAt: Date,
      },
    ],
    attendance: {
      overall: {
        type: Number,
        default: 0,
      },
      bySubject: [
        {
          subject: mongoose.Schema.Types.ObjectId,
          percentage: Number,
          classes: Number,
          present: Number,
          absent: Number,
          late: Number,
        },
      ],
    },
    currentGPA: {
      type: Number,
      default: 0,
    },
    totalCreditsEarned: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'graduated', 'suspended'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

const Student = User.discriminator('student', studentSchema);

module.exports = Student;
