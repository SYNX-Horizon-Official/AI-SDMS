const fs = require('fs');
const path = require('path');

const STORAGE_ROOT = process.env.FILE_UPLOAD_PATH || path.join(__dirname, '..', '..', 'uploads');

exports.ensureDir = (p) => {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
};

exports.saveFile = async ({ classroomId, file }) => {
  const dir = path.join(STORAGE_ROOT, 'classrooms', String(classroomId));
  exports.ensureDir(dir);
  const dest = path.join(dir, file.filename);
  // file already stored by multer in temp destination; move if needed
  // If multer stores in memory, you'd write buffer -> file. We assume diskStorage.
  return {
    path: dest,
    filename: file.filename,
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  };
};

exports.getFilePath = ({ classroomId, filename }) => {
  return path.join(STORAGE_ROOT, 'classrooms', String(classroomId), filename);
};
