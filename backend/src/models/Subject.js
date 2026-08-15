const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      unique: true,
    },
    code: {
      type: String,
      required: [true, 'Subject code is required'],
      unique: true,
      // e.g., "CS-101", "MTH-201"
    },
    description: String,
    creditHours: {
      type: Number,
      required: [true, 'Credit hours is required'],
      min: 1,
      max: 4,
    },
    totalMarks: {
      type: Number,
      default: 100,
    },
    theory: {
      type: Number,
      default: 80,
    },
    practical: {
      type: Number,
      default: 20,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 8,
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: [true, 'Batch is required'],
    },
    assignedFaculty: [
      {
        faculty: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Faculty',
        },
        section: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Section',
        },
      },
    ],
    prerequisites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
      },
    ],
    syllabus: String,
    courseOutcome: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HOD',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique subject per batch and semester
subjectSchema.index({ batch: 1, code: 1 }, { unique: true });

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;
