const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Section name is required'],
      // e.g., "A", "B", "C"
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: [true, 'Batch is required'],
    },
    totalSeats: {
      type: Number,
      required: [true, 'Total seats is required'],
    },
    enrolledStudents: {
      type: Number,
      default: 0,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
    inchargeTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
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

// Compound index for unique section per batch
sectionSchema.index({ batch: 1, name: 1 }, { unique: true });

const Section = mongoose.model('Section', sectionSchema);

module.exports = Section;
