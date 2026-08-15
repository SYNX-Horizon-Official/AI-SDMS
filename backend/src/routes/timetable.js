const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const timetableController = require('../controllers/timetableController');

// Create timetable manually (HOD only)
router.post('/', verifyToken, checkRole('hod'), timetableController.createTimetable);

// Upload timetable from file (HOD only)
router.post('/upload', verifyToken, checkRole('hod'), upload.single('file'), timetableController.uploadTimetableFile);

// Get all timetables
router.get('/', verifyToken, timetableController.getAllTimetables);

// Get timetable by ID
router.get('/:timetableId', verifyToken, timetableController.getTimetableById);

// Get student timetable
router.get('/student/:sectionId', verifyToken, timetableController.getStudentTimetable);

// Get faculty timetable
router.get('/faculty/:facultyId', verifyToken, timetableController.getFacultyTimetable);

// Update timetable entry (HOD only)
router.put('/:timetableId/entry/:entryIndex', verifyToken, checkRole('hod'), timetableController.updateTimetableEntry);

// Delete timetable entry (HOD only)
router.delete('/:timetableId/entry/:entryIndex', verifyToken, checkRole('hod'), timetableController.deleteTimetableEntry);

// Deactivate timetable (HOD only)
router.patch('/:timetableId/deactivate', verifyToken, checkRole('hod'), timetableController.deactivateTimetable);

module.exports = router;
