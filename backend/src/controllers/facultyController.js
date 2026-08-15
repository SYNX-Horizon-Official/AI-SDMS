const Faculty = require('../models/Faculty');

// Create Faculty
const createFaculty = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      employeeId,
      qualification,
      designation,
      department,
      employmentStatus,
      phone,
    } = req.body;

    // Check if employee already exists
    const existingFaculty = await Faculty.findOne({ email });
    if (existingFaculty) {
      return res.status(400).json({
        success: false,
        message: 'Faculty with this email already exists',
      });
    }

    const existingId = await Faculty.findOne({ employeeId });
    if (existingId) {
      return res.status(400).json({
        success: false,
        message: 'Faculty with this employee ID already exists',
      });
    }

    // Create faculty
    const faculty = new Faculty({
      firstName,
      lastName,
      email,
      password,
      employeeId,
      qualification,
      designation,
      department,
      employmentStatus,
      phone,
      role: 'faculty',
    });

    await faculty.save();

    res.status(201).json({
      success: true,
      message: 'Faculty created successfully',
      data: {
        id: faculty._id,
        employeeId: faculty.employeeId,
        email: faculty.email,
        firstName: faculty.firstName,
        lastName: faculty.lastName,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating faculty',
      error: error.message,
    });
  }
};

// Get All Faculty
const getAllFaculty = async (req, res) => {
  try {
    const { department, designation, status, page = 1, limit = 20 } = req.query;

    let filter = {};
    if (department) filter.department = department;
    if (designation) filter.designation = designation;
    if (status) filter.employmentStatus = status;

    const skip = (page - 1) * limit;

    const faculty = await Faculty.find(filter)
      .populate('department')
      .populate('assignedSubjects')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Faculty.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: faculty,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching faculty',
      error: error.message,
    });
  }
};

// Get Faculty by ID
const getFacultyById = async (req, res) => {
  try {
    const { facultyId } = req.params;

    const faculty = await Faculty.findById(facultyId)
      .populate('department')
      .populate('assignedSubjects')
      .populate('assignedBatches')
      .populate('assignedSections');

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found',
      });
    }

    res.status(200).json({
      success: true,
      data: faculty,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching faculty',
      error: error.message,
    });
  }
};

// Update Faculty
const updateFaculty = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const allowedFields = [
      'firstName',
      'lastName',
      'phone',
      'qualification',
      'designation',
      'officeHours',
      'specialization',
      'profilePicture',
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const faculty = await Faculty.findByIdAndUpdate(facultyId, updates, { new: true });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Faculty updated successfully',
      data: faculty,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating faculty',
      error: error.message,
    });
  }
};

// Assign Subjects to Faculty
const assignSubjects = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const { subjectIds } = req.body;

    if (!Array.isArray(subjectIds) || subjectIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Subject IDs must be provided as an array',
      });
    }

    const faculty = await Faculty.findByIdAndUpdate(
      facultyId,
      { assignedSubjects: subjectIds },
      { new: true }
    ).populate('assignedSubjects');

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subjects assigned successfully',
      data: faculty,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error assigning subjects',
      error: error.message,
    });
  }
};

// Assign Batches to Faculty
const assignBatches = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const { batchIds } = req.body;

    if (!Array.isArray(batchIds) || batchIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Batch IDs must be provided as an array',
      });
    }

    const faculty = await Faculty.findByIdAndUpdate(
      facultyId,
      { assignedBatches: batchIds },
      { new: true }
    ).populate('assignedBatches');

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Batches assigned successfully',
      data: faculty,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error assigning batches',
      error: error.message,
    });
  }
};

// Deactivate Faculty
const deactivateFaculty = async (req, res) => {
  try {
    const { facultyId } = req.params;

    const faculty = await Faculty.findByIdAndUpdate(
      facultyId,
      { isActive: false },
      { new: true }
    );

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Faculty deactivated successfully',
      data: faculty,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deactivating faculty',
      error: error.message,
    });
  }
};

module.exports = {
  createFaculty,
  getAllFaculty,
  getFacultyById,
  updateFaculty,
  assignSubjects,
  assignBatches,
  deactivateFaculty,
};
