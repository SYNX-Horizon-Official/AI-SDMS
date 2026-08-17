const mongoose = require('mongoose');

const ClassMessageSchema = new mongoose.Schema({
  classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LectureFile' }],
  createdAt: { type: Date, default: Date.now }
});

ClassMessageSchema.index({ classroom: 1, createdAt: -1 });

module.exports = mongoose.model('ClassMessage', ClassMessageSchema);
