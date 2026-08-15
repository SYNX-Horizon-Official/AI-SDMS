const Subject = require('../models/Subject');
const Batch = require('../models/Batch');

// Create Subject
const createSubject = async (req, res) => {
  try {
    const {
      name,
      code,
      description,
      creditHours,
      semester,
      batch,
      totalMarks,
      theory,
      practical,
    } = req.body;

    // Validate required fields
    if (!name || !code || !creditHours || !semester || !batch) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Check if subject code already exists
    const existingSubject = await Subject.findOne({ code });
    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: 'Subject code already exists',
      });
    }

    const subject = new Subject({
      name,
      code,
      description,
      creditHours,
      semester,
      batch,
      totalMarks,
      theory,
      practical,
      createdBy: req.user.id,
    });

    await subject.save();
    await subject.populate('batch');

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: subject,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating subject',
      error: error.message,
    });
  }
};

// Get All Subjects
const getAllSubjects = async (req, res) => {
  try {
    const { batch, semester, page = 1, limit = 20 } = req.query;

    let filter = { isActive: true };
    if (batch) filter.batch = batch;
    if (semester) filter.semester = parseInt(semester);

    const skip = (page - 1) * limit;

    const subjects = await Subject.find(filter)
      .populate('batch')
      .populate('assignedFaculty.faculty')
      .populate('assignedFaculty.section')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ semester: 1, code: 1 });

    const total = await Subject.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: subjects,
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
      message: 'Error fetching subjects',
      error: error.message,
    });
  }
};

// Get Subject by ID
const getSubjectById = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const subject = await Subject.findById(subjectId)
      .populate('batch')
      .populate('assignedFaculty.faculty')
      .populate('assignedFaculty.section')
      .populate('prerequisites');

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subject',
      error: error.message,
    });
  }
};

// Update Subject
const updateSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const allowedFields = [
      'name',
      'description',
      'creditHours',
      'totalMarks',
      'theory',
      'practical',
      'syllabus',
      'courseOutcome',
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const subject = await Subject.findByIdAndUpdate(subjectId, updates, {
      new: true,
    }).populate('batch');

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subject updated successfully',
      data: subject,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating subject',
      error: error.message,
    });
  }
};

// Assign Faculty to Subject
const assignFacultyToSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { facultyId, sectionId } = req.body;

    if (!facultyId || !sectionId) {
      return res.status(400).json({
        success: false,
        message: 'Faculty ID and Section ID are required',
      });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    // Check if already assigned
    const alreadyAssigned = subject.assignedFaculty.some(
      af => af.faculty.toString() === facultyId && af.section.toString() === sectionId
    );

    if (alreadyAssigned) {
      return res.status(400).json({
        success: false,
        message: 'Faculty already assigned to this subject in this section',
      });
    }

    subject.assignedFaculty.push({ faculty: facultyId, section: sectionId });
    await subject.save();
    await subject.populate('assignedFaculty.faculty');
    await subject.populate('assignedFaculty.section');

    res.status(200).json({
      success: true,
      message: 'Faculty assigned successfully',
      data: subject,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error assigning faculty',
      error: error.message,
    });
  }
};

// Remove Faculty from Subject
const removeFacultyFromSubject = async (req, res) => {
  try {
    const { subjectId, facultyId, sectionId } = req.params;

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    subject.assignedFaculty = subject.assignedFaculty.filter(
      af => !(af.faculty.toString() === facultyId && af.section.toString() === sectionId)
    );

    await subject.save();
    await subject.populate('assignedFaculty.faculty');
    await subject.populate('assignedFaculty.section');

    res.status(200).json({
      success: true,
      message: 'Faculty removed successfully',
      data: subject,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing faculty',
      error: error.message,
    });
  }
};

// Deactivate Subject
const deactivateSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const subject = await Subject.findByIdAndUpdate(
      subjectId,
      { isActive: false },
      { new: true }
    );

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subject deactivated successfully',
      data: subject,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deactivating subject',
      error: error.message,
    });
  }
};

module.exports = {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  assignFacultyToSubject,
  removeFacultyFromSubject,
  deactivateSubject,
};
