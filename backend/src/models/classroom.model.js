const mongoose = require('mongoose');

const ClassroomSchema = new mongoose.Schema({
  title: { type: String, required: true },
  code: { type: String },
  batch: { type: String },
  section: { type: String },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Classroom', ClassroomSchema);
