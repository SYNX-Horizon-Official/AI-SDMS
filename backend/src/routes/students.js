const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/auth');
const studentController = require('../controllers/studentController');

// Get all students (HOD only)
router.get('/', verifyToken, checkRole('hod'), studentController.getAllStudents);

// Get student by ID (HOD only)
router.get('/:studentId', verifyToken, checkRole('hod'), studentController.getStudentById);

// Update student profile (HOD only)
router.put('/:studentId', verifyToken, checkRole('hod'), studentController.updateStudentProfile);

// Deactivate student (HOD only)
router.patch('/:studentId/deactivate', verifyToken, checkRole('hod'), studentController.deactivateStudent);

// Get student statistics (HOD only)
router.get('/statistics/overview', verifyToken, checkRole('hod'), studentController.getStudentStatistics);

module.exports = router;
