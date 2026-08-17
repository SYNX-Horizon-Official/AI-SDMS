const mongoose = require('mongoose');

const LectureFileSchema = new mongoose.Schema({
  classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  originalName: { type: String },
  filename: { type: String },
  mimetype: { type: String },
  size: { type: Number },
  path: { type: String },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LectureFile', LectureFileSchema);
