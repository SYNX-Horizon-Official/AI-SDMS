const express = require('express');
const router = express.Router();
const classroomCtrl = require('../controllers/classroom.controller');
const fileCtrl = require('../controllers/file.controller');
const chatCtrl = require('../controllers/chat.controller');
const upload = require('../middleware/upload.middleware');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

router.post('/', verifyToken, requireRole(['faculty','hod']), classroomCtrl.createClassroom);
router.get('/mine', verifyToken, classroomCtrl.listForUser);
router.get('/:id', verifyToken, classroomCtrl.getClassroom);
router.post('/:id/enroll', verifyToken, requireRole(['hod','faculty']), classroomCtrl.enrollStudent);

// files
router.get('/:id/files', verifyToken, classroomCtrl.listFiles);
router.post('/:id/files', verifyToken, requireRole(['faculty','hod']), upload.single('file'), fileCtrl.uploadLectureFile);
router.get('/:id/files/:fileId/download', verifyToken, classroomCtrl.downloadFile);

// chat
router.get('/:id/messages', verifyToken, chatCtrl.getMessages);
router.post('/:id/messages', verifyToken, chatCtrl.postMessage);

module.exports = router;
