const express = require('express');
const quizController = require('../controllers/quiz.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

// Create quiz (faculty/HOD only)
router.post('/', verifyToken, requireRole(['faculty', 'hod']), quizController.createQuiz);

// Add question to quiz
router.post('/:quizId/questions', verifyToken, requireRole(['faculty', 'hod']), quizController.addQuestion);

// Get quiz
router.get('/:quizId', verifyToken, quizController.getQuiz);

// Get quizzes for classroom
router.get('/classroom/:classroomId', verifyToken, quizController.getQuizzesForClassroom);

// Publish quiz
router.put('/:quizId/publish', verifyToken, requireRole(['faculty', 'hod']), quizController.publishQuiz);

// Submit quiz
router.post('/:quizId/submit', verifyToken, requireRole(['student']), quizController.submitQuiz);

// Get quiz attempts (teacher)
router.get('/:quizId/attempts', verifyToken, requireRole(['faculty', 'hod']), quizController.getQuizAttempts);

// Get my quiz attempts (student)
router.get('/:quizId/my-attempts', verifyToken, requireRole(['student']), quizController.getMyQuizAttempts);

// Publish quiz result
router.put('/attempts/:attemptId/publish', verifyToken, requireRole(['faculty', 'hod']), quizController.publishQuizResult);

module.exports = router;
