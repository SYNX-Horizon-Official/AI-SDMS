const mongoose = require('mongoose');
const User = require('./User');

const facultySchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
    },
    qualification: {
      type: String,
      required: [true, 'Qualification is required'],
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    officeHours: [
      {
        day: String,
        startTime: String,
        endTime: String,
      },
    ],
    employmentStatus: {
      type: String,
      enum: ['permanent', 'temporary', 'contract'],
      default: 'temporary',
    },
    specialization: String,
    publications: [String],
    assignedSubjects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
    }],
    assignedBatches: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
    }],
    assignedSections: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
    }],
    supervisedFYPs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FYPProposal',
    }],
    leaves: [{
      type: Date,
    }],
    applications: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FacultyApplication',
    }],
    performanceRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Faculty = User.discriminator('faculty', facultySchema);

module.exports = Faculty;
