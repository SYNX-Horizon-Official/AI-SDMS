const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/auth');
const subjectController = require('../controllers/subjectController');

// Create subject (HOD only)
router.post('/', verifyToken, checkRole('hod'), subjectController.createSubject);

// Get all subjects
router.get('/', verifyToken, subjectController.getAllSubjects);

// Get subject by ID
router.get('/:subjectId', verifyToken, subjectController.getSubjectById);

// Update subject (HOD only)
router.put('/:subjectId', verifyToken, checkRole('hod'), subjectController.updateSubject);

// Assign faculty to subject (HOD only)
router.post('/:subjectId/assign-faculty', verifyToken, checkRole('hod'), subjectController.assignFacultyToSubject);

// Remove faculty from subject (HOD only)
router.delete('/:subjectId/faculty/:facultyId/section/:sectionId', verifyToken, checkRole('hod'), subjectController.removeFacultyFromSubject);

// Deactivate subject (HOD only)
router.patch('/:subjectId/deactivate', verifyToken, checkRole('hod'), subjectController.deactivateSubject);

module.exports = router;
