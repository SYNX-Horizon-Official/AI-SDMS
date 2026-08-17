const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentId: { type: String, required: true },
  batch: { type: String, required: true },
  section: { type: String, required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  date: { type: Date, required: true },
  classTime: { type: String },
  status: { type: String, enum: ['present', 'absent', 'late', 'leave'], required: true },
  topic: { type: String },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

AttendanceSchema.index({ student: 1, date: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
