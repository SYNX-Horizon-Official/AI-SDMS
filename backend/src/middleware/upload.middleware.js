const multer = require('multer');
const path = require('path');

const allowed = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.png', '.jpg', '.jpeg', '.mp4'];
const maxBytes = (process.env.MAX_UPLOAD_MB ? parseInt(process.env.MAX_UPLOAD_MB,10) : 50) * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'temp_uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random()*1e6)}${ext}`;
    cb(null, name);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.includes(ext)) return cb(new Error('File type not allowed'), false);
  cb(null, true);
};

module.exports = multer({ storage, limits: { fileSize: maxBytes }, fileFilter });
