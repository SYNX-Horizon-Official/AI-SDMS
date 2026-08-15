const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/auth');
const batchSectionController = require('../controllers/batchSectionController');

// Batch Routes
// Create batch (HOD only)
router.post('/batches', verifyToken, checkRole('hod'), batchSectionController.createBatch);

// Get all batches
router.get('/batches', verifyToken, batchSectionController.getAllBatches);

// Get batch by ID
router.get('/batches/:batchId', verifyToken, batchSectionController.getBatchById);

// Update batch (HOD only)
router.put('/batches/:batchId', verifyToken, checkRole('hod'), batchSectionController.updateBatch);

// Section Routes
// Create section (HOD only)
router.post('/sections', verifyToken, checkRole('hod'), batchSectionController.createSection);

// Get all sections
router.get('/sections', verifyToken, batchSectionController.getAllSections);

// Get section by ID
router.get('/sections/:sectionId', verifyToken, batchSectionController.getSectionById);

// Assign students to section (HOD only)
router.post('/sections/:sectionId/assign-students', verifyToken, checkRole('hod'), batchSectionController.assignStudentsToSection);

// Assign incharge teacher (HOD only)
router.post('/sections/:sectionId/assign-teacher', verifyToken, checkRole('hod'), batchSectionController.assignInchargeTeacher);

module.exports = router;
