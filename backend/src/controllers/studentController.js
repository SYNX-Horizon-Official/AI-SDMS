const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Batch = require('../models/Batch');
const Section = require('../models/Section');

// Get All Students
const getAllStudents = async (req, res) => {
  try {
    const { batch, section, semester, status, page = 1, limit = 20 } = req.query;

    let filter = {};
    if (batch) filter.batch = batch;
    if (section) filter.section = section;
    if (semester) filter.semester = semester;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const students = await Student.find(filter)
      .populate('batch')
      .populate('section')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ studentId: 1 });

    const total = await Student.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: students,
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
      message: 'Error fetching students',
      error: error.message,
    });
  }
};

// Get Student by ID
const getStudentById = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId)
      .populate('batch')
      .populate('section');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching student',
      error: error.message,
    });
  }
};

// Update Student Profile
const updateStudentProfile = async (req, res) => {
  try {
    const { studentId } = req.params;
    const allowedFields = [
      'firstName',
      'lastName',
      'phone',
      'cnic',
      'bloodGroup',
      'profilePicture',
      'idCardPicture',
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const student = await Student.findByIdAndUpdate(studentId, updates, { new: true });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student profile updated successfully',
      data: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating student profile',
      error: error.message,
    });
  }
};

// Deactivate Student
const deactivateStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findByIdAndUpdate(
      studentId,
      { isActive: false, status: 'inactive' },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student deactivated successfully',
      data: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deactivating student',
      error: error.message,
    });
  }
};

// Get Student Statistics
const getStudentStatistics = async (req, res) => {
  try {
    const { batch, section } = req.query;

    let filter = { status: 'active' };
    if (batch) filter.batch = batch;
    if (section) filter.section = section;

    const totalStudents = await Student.countDocuments(filter);
    const femaleStudents = await Student.countDocuments({
      ...filter,
      // Additional gender field if available
    });
    const avgGPA = await Student.aggregate([
      { $match: filter },
      { $group: { _id: null, avgGPA: { $avg: '$currentGPA' } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        femaleStudents,
        averageGPA: avgGPA[0]?.avgGPA || 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message,
    });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  updateStudentProfile,
  deactivateStudent,
  getStudentStatistics,
};
