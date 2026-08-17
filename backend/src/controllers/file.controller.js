const LectureFile = require('../models/lecturefile.model');
const Classroom = require('../models/classroom.model');
const storage = require('../services/storage.service');
const fs = require('fs');
const path = require('path');

exports.uploadLectureFile = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    // move file from temp_uploads to classroom folder
    const destDir = path.join(process.env.FILE_UPLOAD_PATH || path.join(__dirname,'..','..','uploads'), 'classrooms', String(classroomId));
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    const dest = path.join(destDir, file.filename);
    fs.renameSync(file.path, dest);

    const meta = await LectureFile.create({
      classroom: classroomId,
      uploadedBy: req.user.id,
      originalName: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      path: dest
    });

    return res.json(meta);
  } catch (err) {
    console.error('uploadLectureFile', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
