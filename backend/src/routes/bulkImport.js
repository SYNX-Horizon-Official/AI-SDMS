const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const bulkImportService = require('../services/bulkImportService');

// Bulk import students (HOD only)
router.post(
  '/students',
  verifyToken,
  checkRole('hod'),
  upload.single('file'),
  bulkImportService.bulkImportStudents
);

// Get bulk import report (HOD only)
router.get('/report/:importId', verifyToken, checkRole('hod'), bulkImportService.getBulkImportReport);

// Get all bulk imports (HOD only)
router.get('/', verifyToken, checkRole('hod'), bulkImportService.getBulkImports);

module.exports = router;
