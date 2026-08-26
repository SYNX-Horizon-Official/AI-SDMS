const express = require('express');
const examController = require('../controllers/exam.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

// Create exam (faculty/HOD only)
router.post('/', verifyToken, requireRole(['faculty', 'hod']), examController.createExam);

// Add question to exam
router.post('/:examId/questions', verifyToken, requireRole(['faculty', 'hod']), examController.addQuestion);

// Edit question
router.put('/:examId/questions/:questionId', verifyToken, requireRole(['faculty', 'hod']), examController.editQuestion);

// Delete question
router.delete('/:examId/questions/:questionId', verifyToken, requireRole(['faculty', 'hod']), examController.deleteQuestion);

// Get exam (teacher view with answers)
router.get('/:examId/teacher', verifyToken, requireRole(['faculty', 'hod']), examController.getExamForTeacher);

// Get exam (student view without answers)
router.get('/:examId/student', verifyToken, requireRole(['student']), examController.getExamForStudent);

// Publish exam
router.put('/:examId/publish', verifyToken, requireRole(['faculty', 'hod']), examController.publishExam);

// Launch exam
router.put('/:examId/launch', verifyToken, requireRole(['faculty', 'hod']), examController.launchExam);

// Submit exam
router.post('/:examId/submit', verifyToken, requireRole(['student']), examController.submitExam);

// Get exam attempts (teacher)
router.get('/:examId/attempts', verifyToken, requireRole(['faculty', 'hod']), examController.getExamAttempts);

// Get student exam attempt
router.get('/:examId/my-attempt', verifyToken, requireRole(['student']), examController.getStudentAttempt);

// Update invigilator record
router.put('/attempts/:attemptId/invigilator', verifyToken, requireRole(['hod']), examController.updateInvigilator);

// Update security violations
router.put('/attempts/:attemptId/violation', verifyToken, examController.updateSecurityViolation);

module.exports = router;
