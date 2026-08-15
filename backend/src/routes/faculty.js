const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/auth');
const facultyController = require('../controllers/facultyController');

// Create faculty (HOD only)
router.post('/', verifyToken, checkRole('hod'), facultyController.createFaculty);

// Get all faculty (HOD only)
router.get('/', verifyToken, checkRole('hod'), facultyController.getAllFaculty);

// Get faculty by ID (HOD only)
router.get('/:facultyId', verifyToken, checkRole('hod'), facultyController.getFacultyById);

// Update faculty (HOD only)
router.put('/:facultyId', verifyToken, checkRole('hod'), facultyController.updateFaculty);

// Assign subjects to faculty (HOD only)
router.post('/:facultyId/assign-subjects', verifyToken, checkRole('hod'), facultyController.assignSubjects);

// Assign batches to faculty (HOD only)
router.post('/:facultyId/assign-batches', verifyToken, checkRole('hod'), facultyController.assignBatches);

// Deactivate faculty (HOD only)
router.patch('/:facultyId/deactivate', verifyToken, checkRole('hod'), facultyController.deactivateFaculty);

module.exports = router;
