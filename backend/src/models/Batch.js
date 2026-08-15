const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Batch name is required'],
      unique: true,
      // e.g., "BSIT-2023"
    },
    program: {
      type: String,
      required: [true, 'Program is required'],
      // e.g., "BSIT", "BSCS"
    },
    startYear: {
      type: Number,
      required: [true, 'Start year is required'],
    },
    endYear: {
      type: Number,
      required: [true, 'End year is required'],
    },
    totalStudents: {
      type: Number,
      default: 0,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HOD',
    },
    status: {
      type: String,
      enum: ['active', 'graduated', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

const Batch = mongoose.model('Batch', batchSchema);

module.exports = Batch;
