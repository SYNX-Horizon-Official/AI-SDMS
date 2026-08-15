const Timetable = require('../models/Timetable');
const Subject = require('../models/Subject');
const Section = require('../models/Section');
const XLSX = require('xlsx');
const fs = require('fs');

// Create Timetable Manually
const createTimetable = async (req, res) => {
  try {
    const { name, batch, semester, academicYear, entries } = req.body;

    if (!name || !batch || !semester || !academicYear || !entries || entries.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const timetable = new Timetable({
      name,
      batch,
      semester,
      academicYear,
      entries,
      createdBy: req.user.id,
    });

    await timetable.save();
    await timetable.populate('batch');
    await timetable.populate('entries.subject');
    await timetable.populate('entries.section');
    await timetable.populate('entries.faculty');

    res.status(201).json({
      success: true,
      message: 'Timetable created successfully',
      data: timetable,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating timetable',
      error: error.message,
    });
  }
};

// Upload Timetable from Excel
const uploadTimetableFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const { name, batch, semester, academicYear } = req.body;

    if (!name || !batch || !semester || !academicYear) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Parse Excel file
    const workbook = XLSX.readFile(req.file.path);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Excel file is empty',
      });
    }

    // Parse entries
    const entries = [];
    const errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        const entry = {
          day: row.day,
          time: {
            startTime: row.startTime,
            endTime: row.endTime,
          },
          section: row.sectionId,
          type: row.type || 'lecture',
          isFree: row.isFree === 'yes' || row.isFree === true,
        };

        if (row.subjectId) entry.subject = row.subjectId;
        if (row.facultyId) entry.faculty = row.facultyId;
        if (row.room) entry.room = row.room;

        entries.push(entry);
      } catch (error) {
        errors.push({
          row: i + 2,
          error: error.message,
        });
      }
    }

    if (entries.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'No valid entries found in file',
        errors,
      });
    }

    // Create timetable
    const timetable = new Timetable({
      name,
      batch,
      semester,
      academicYear,
      entries,
      createdBy: req.user.id,
    });

    await timetable.save();
    await timetable.populate('batch');
    await timetable.populate('entries.subject');
    await timetable.populate('entries.section');
    await timetable.populate('entries.faculty');

    // Clean up file
    fs.unlinkSync(req.file.path);

    res.status(201).json({
      success: true,
      message: 'Timetable uploaded successfully',
      data: timetable,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({
      success: false,
      message: 'Error uploading timetable',
      error: error.message,
    });
  }
};

// Get All Timetables
const getAllTimetables = async (req, res) => {
  try {
    const { batch, semester, page = 1, limit = 20 } = req.query;

    let filter = { isActive: true };
    if (batch) filter.batch = batch;
    if (semester) filter.semester = parseInt(semester);

    const skip = (page - 1) * limit;

    const timetables = await Timetable.find(filter)
      .populate('batch')
      .populate('entries.subject')
      .populate('entries.section')
      .populate('entries.faculty')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Timetable.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: timetables,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching timetables',
      error: error.message,
    });
  }
};

// Get Timetable by ID
const getTimetableById = async (req, res) => {
  try {
    const { timetableId } = req.params;

    const timetable = await Timetable.findById(timetableId)
      .populate('batch')
      .populate('entries.subject')
      .populate('entries.section')
      .populate('entries.faculty');

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable not found',
      });
    }

    res.status(200).json({
      success: true,
      data: timetable,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching timetable',
      error: error.message,
    });
  }
};

// Get Student Timetable
const getStudentTimetable = async (req, res) => {
  try {
    const { sectionId } = req.params;

    const timetable = await Timetable.findOne({
      'entries.section': sectionId,
      isActive: true,
    })
      .populate('batch')
      .populate('entries.subject')
      .populate('entries.section')
      .populate('entries.faculty');

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'No timetable found for this section',
      });
    }

    // Filter entries for this section only
    const filteredEntries = timetable.entries.filter(
      entry => entry.section._id.toString() === sectionId
    );

    res.status(200).json({
      success: true,
      data: {
        ...timetable.toObject(),
        entries: filteredEntries,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching student timetable',
      error: error.message,
    });
  }
};

// Get Faculty Timetable
const getFacultyTimetable = async (req, res) => {
  try {
    const { facultyId } = req.params;

    const timetables = await Timetable.find({
      'entries.faculty': facultyId,
      isActive: true,
    })
      .populate('batch')
      .populate('entries.subject')
      .populate('entries.section')
      .populate('entries.faculty');

    // Filter entries for this faculty
    const filteredTimetables = timetables.map(tt => ({
      ...tt.toObject(),
      entries: tt.entries.filter(entry => entry.faculty._id.toString() === facultyId),
    }));

    res.status(200).json({
      success: true,
      data: filteredTimetables,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching faculty timetable',
      error: error.message,
    });
  }
};

// Update Timetable Entry
const updateTimetableEntry = async (req, res) => {
  try {
    const { timetableId, entryIndex } = req.params;
    const updates = req.body;

    const timetable = await Timetable.findById(timetableId);
    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable not found',
      });
    }

    if (entryIndex < 0 || entryIndex >= timetable.entries.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid entry index',
      });
    }

    // Update entry
    Object.keys(updates).forEach(key => {
      timetable.entries[entryIndex][key] = updates[key];
    });

    await timetable.save();
    await timetable.populate('entries.subject');
    await timetable.populate('entries.section');
    await timetable.populate('entries.faculty');

    res.status(200).json({
      success: true,
      message: 'Timetable entry updated successfully',
      data: timetable,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating timetable entry',
      error: error.message,
    });
  }
};

// Delete Timetable Entry
const deleteTimetableEntry = async (req, res) => {
  try {
    const { timetableId, entryIndex } = req.params;

    const timetable = await Timetable.findById(timetableId);
    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable not found',
      });
    }

    if (entryIndex < 0 || entryIndex >= timetable.entries.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid entry index',
      });
    }

    timetable.entries.splice(entryIndex, 1);
    await timetable.save();
    await timetable.populate('entries.subject');
    await timetable.populate('entries.section');
    await timetable.populate('entries.faculty');

    res.status(200).json({
      success: true,
      message: 'Timetable entry deleted successfully',
      data: timetable,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting timetable entry',
      error: error.message,
    });
  }
};

// Deactivate Timetable
const deactivateTimetable = async (req, res) => {
  try {
    const { timetableId } = req.params;

    const timetable = await Timetable.findByIdAndUpdate(
      timetableId,
      { isActive: false },
      { new: true }
    );

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Timetable deactivated successfully',
      data: timetable,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deactivating timetable',
      error: error.message,
    });
  }
};

module.exports = {
  createTimetable,
  uploadTimetableFile,
  getAllTimetables,
  getTimetableById,
  getStudentTimetable,
  getFacultyTimetable,
  updateTimetableEntry,
  deleteTimetableEntry,
  deactivateTimetable,
};
