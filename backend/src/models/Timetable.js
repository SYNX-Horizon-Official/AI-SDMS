const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Timetable name is required'],
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: [true, 'Batch is required'],
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      // e.g., "2023-2024"
    },
    entries: [
      {
        day: {
          type: String,
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          required: true,
        },
        time: {
          startTime: {
            type: String,
            required: true,
            // e.g., "09:00"
          },
          endTime: {
            type: String,
            required: true,
            // e.g., "10:30"
          },
        },
        subject: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Subject',
        },
        section: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Section',
          required: true,
        },
        faculty: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Faculty',
        },
        room: String, // Optional room number
        type: {
          type: String,
          enum: ['lecture', 'lab', 'tutorial', 'free'],
          default: 'lecture',
        },
        isFree: {
          type: Boolean,
          default: false,
        },
      },
    ],
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

const Timetable = mongoose.model('Timetable', timetableSchema);

module.exports = Timetable;
