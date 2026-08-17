const express = require('express');
const router = express.Router();
const attendanceCtrl = require('../controllers/attendance.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

// Only faculty and hod can mark/edit attendance
router.post('/mark', verifyToken, requireRole(['faculty','hod']), attendanceCtrl.markAttendance);
router.put('/:id', verifyToken, requireRole(['faculty','hod']), attendanceCtrl.editAttendance);

// Students can view their own attendance
router.get('/student/:studentId', verifyToken, requireRole(['student','faculty','hod']), attendanceCtrl.getAttendanceByStudent);

// Class-level attendance (faculty/hod)
router.get('/class', verifyToken, requireRole(['faculty','hod']), attendanceCtrl.getAttendanceByClass);

// Stats
router.get('/stats', verifyToken, requireRole(['student','faculty','hod']), attendanceCtrl.getAttendanceStats);

module.exports = router;
