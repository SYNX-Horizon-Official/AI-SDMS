const Batch = require('../models/Batch');
const Section = require('../models/Section');

// Create Batch
const createBatch = async (req, res) => {
  try {
    const { name, program, startYear, endYear, department } = req.body;

    if (!name || !program || !startYear || !endYear) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const existingBatch = await Batch.findOne({ name });
    if (existingBatch) {
      return res.status(400).json({
        success: false,
        message: 'Batch already exists',
      });
    }

    const batch = new Batch({
      name,
      program,
      startYear,
      endYear,
      department,
      createdBy: req.user.id,
    });

    await batch.save();
    await batch.populate('department');
    await batch.populate('createdBy');

    res.status(201).json({
      success: true,
      message: 'Batch created successfully',
      data: batch,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating batch',
      error: error.message,
    });
  }
};

// Get All Batches
const getAllBatches = async (req, res) => {
  try {
    const { program, status, page = 1, limit = 20 } = req.query;

    let filter = {};
    if (program) filter.program = program;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const batches = await Batch.find(filter)
      .populate('department')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ startYear: -1 });

    const total = await Batch.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: batches,
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
      message: 'Error fetching batches',
      error: error.message,
    });
  }
};

// Get Batch by ID
const getBatchById = async (req, res) => {
  try {
    const { batchId } = req.params;

    const batch = await Batch.findById(batchId)
      .populate('department')
      .populate('createdBy');

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found',
      });
    }

    // Get sections in this batch
    const sections = await Section.find({ batch: batchId }).populate('students');

    res.status(200).json({
      success: true,
      data: {
        batch,
        sections,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching batch',
      error: error.message,
    });
  }
};

// Update Batch
const updateBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const allowedFields = ['endYear', 'status'];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const batch = await Batch.findByIdAndUpdate(batchId, updates, { new: true });

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Batch updated successfully',
      data: batch,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating batch',
      error: error.message,
    });
  }
};

// Create Section
const createSection = async (req, res) => {
  try {
    const { name, batch, totalSeats } = req.body;

    if (!name || !batch || !totalSeats) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const existingSection = await Section.findOne({ batch, name });
    if (existingSection) {
      return res.status(400).json({
        success: false,
        message: 'Section already exists in this batch',
      });
    }

    const section = new Section({
      name,
      batch,
      totalSeats,
      createdBy: req.user.id,
    });

    await section.save();
    await section.populate('batch');

    res.status(201).json({
      success: true,
      message: 'Section created successfully',
      data: section,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating section',
      error: error.message,
    });
  }
};

// Get All Sections
const getAllSections = async (req, res) => {
  try {
    const { batch, page = 1, limit = 20 } = req.query;

    let filter = {};
    if (batch) filter.batch = batch;

    const skip = (page - 1) * limit;

    const sections = await Section.find(filter)
      .populate('batch')
      .populate('students')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ batch: 1, name: 1 });

    const total = await Section.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: sections,
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
      message: 'Error fetching sections',
      error: error.message,
    });
  }
};

// Get Section by ID
const getSectionById = async (req, res) => {
  try {
    const { sectionId } = req.params;

    const section = await Section.findById(sectionId)
      .populate('batch')
      .populate('students')
      .populate('inchargeTeacher');

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found',
      });
    }

    res.status(200).json({
      success: true,
      data: section,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching section',
      error: error.message,
    });
  }
};

// Assign Students to Section
const assignStudentsToSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { studentIds } = req.body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Student IDs must be provided as an array',
      });
    }

    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found',
      });
    }

    // Check capacity
    if (section.students.length + studentIds.length > section.totalSeats) {
      return res.status(400).json({
        success: false,
        message: 'Not enough seats available',
      });
    }

    // Add students
    section.students.push(...studentIds);
    section.enrolledStudents = section.students.length;
    await section.save();
    await section.populate('students');

    res.status(200).json({
      success: true,
      message: 'Students assigned successfully',
      data: section,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error assigning students',
      error: error.message,
    });
  }
};

// Assign Incharge Teacher to Section
const assignInchargeTeacher = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { facultyId } = req.body;

    if (!facultyId) {
      return res.status(400).json({
        success: false,
        message: 'Faculty ID is required',
      });
    }

    const section = await Section.findByIdAndUpdate(
      sectionId,
      { inchargeTeacher: facultyId },
      { new: true }
    ).populate('inchargeTeacher');

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Incharge teacher assigned successfully',
      data: section,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error assigning incharge teacher',
      error: error.message,
    });
  }
};

module.exports = {
  createBatch,
  getAllBatches,
  getBatchById,
  updateBatch,
  createSection,
  getAllSections,
  getSectionById,
  assignStudentsToSection,
  assignInchargeTeacher,
};
