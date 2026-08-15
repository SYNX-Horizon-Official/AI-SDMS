const mongoose = require('mongoose');
const User = require('./User');

const hodSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    designation: {
      type: String,
      default: 'Head of Department',
    },
    officeLocation: String,
    officePhone: String,
    authority: {
      canManageStudents: {
        type: Boolean,
        default: true,
      },
      canManageFaculty: {
        type: Boolean,
        default: true,
      },
      canApproveExams: {
        type: Boolean,
        default: true,
      },
      canManageBatches: {
        type: Boolean,
        default: true,
      },
      canViewReports: {
        type: Boolean,
        default: true,
      },
      canApproveFYP: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

const HOD = User.discriminator('hod', hodSchema);

module.exports = HOD;
