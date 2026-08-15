const XLSX = require('xlsx');
const fs = require('fs');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const BulkImport = require('../models/BulkImport');
const { generateTemporaryPassword } = require('../utils/passwordGenerator');
const nodemailer = require('nodemailer');

// Email transporter (configure with your email service)
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_HOST || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Parse Excel file
const parseExcelFile = (filePath) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);
    return data;
  } catch (error) {
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
};

// Validate student row
const validateStudentRow = (row, rowNumber) => {
  const errors = [];

  if (!row.studentId || !row.studentId.match(/^[A-Z]+-\d{4}-\d{3}$/)) {
    errors.push('Invalid Student ID format (e.g., BSIT-2023-009)');
  }

  if (!row.firstName) {
    errors.push('First name is required');
  }

  if (!row.lastName) {
    errors.push('Last name is required');
  }

  if (!row.email || !row.email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
    errors.push('Invalid email format');
  }

  if (!row.rollNumber) {
    errors.push('Roll number is required');
  }

  if (!row.batch) {
    errors.push('Batch is required');
  }

  if (!row.section) {
    errors.push('Section is required');
  }

  if (!row.semester || isNaN(row.semester) || row.semester < 1 || row.semester > 8) {
    errors.push('Invalid semester (must be 1-8)');
  }

  return errors;
};

// Bulk Import Students
const bulkImportStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const filePath = req.file.path;
    const data = parseExcelFile(filePath);

    // Create bulk import record
    const bulkImport = new BulkImport({
      fileName: req.file.filename,
      fileUrl: filePath,
      totalRecords: data.length,
      importType: 'students',
      importedBy: req.user.id,
      status: 'processing',
    });

    const successfulRecords = [];
    const errors = [];

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2; // Excel row number (1-indexed, +1 for header)

      // Validate row
      const validationErrors = validateStudentRow(row, rowNumber);

      if (validationErrors.length > 0) {
        errors.push({
          rowNumber,
          rowData: row,
          errorMessage: validationErrors.join(', '),
        });
        bulkImport.failedImports++;
        continue;
      }

      // Check for duplicate student
      const existingStudent = await Student.findOne({ studentId: row.studentId });
      if (existingStudent) {
        errors.push({
          rowNumber,
          rowData: row,
          errorMessage: 'Student ID already exists',
        });
        bulkImport.failedImports++;
        continue;
      }

      const existingEmail = await Student.findOne({ email: row.email });
      if (existingEmail) {
        errors.push({
          rowNumber,
          rowData: row,
          errorMessage: 'Email already registered',
        });
        bulkImport.failedImports++;
        continue;
      }

      try {
        // Generate temporary password
        const tempPassword = generateTemporaryPassword();

        // Create student
        const student = new Student({
          studentId: row.studentId,
          rollNumber: row.rollNumber,
          email: row.email,
          firstName: row.firstName,
          lastName: row.lastName,
          phone: row.phone || '',
          batch: row.batch,
          section: row.section,
          semester: parseInt(row.semester),
          cnic: row.cnic || '',
          bloodGroup: row.bloodGroup || '',
          password: tempPassword,
          isFirstLogin: true,
          changePasswordRequired: true,
          role: 'student',
        });

        await student.save();

        // Store successful record
        successfulRecords.push({
          email: student.email,
          id: student.studentId,
          password: tempPassword,
        });

        bulkImport.successfulImports++;

        // Send email with credentials
        await sendStudentCredentialsEmail(student.email, student.firstName, student.studentId, tempPassword);
      } catch (error) {
        errors.push({
          rowNumber,
          rowData: row,
          errorMessage: error.message,
        });
        bulkImport.failedImports++;
      }
    }

    // Update bulk import record
    bulkImport.errors = errors;
    bulkImport.successfulRecords = successfulRecords;
    bulkImport.status = 'completed';
    await bulkImport.save();

    // Clean up file
    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      message: 'Bulk import completed',
      data: {
        importId: bulkImport._id,
        totalRecords: bulkImport.totalRecords,
        successfulImports: bulkImport.successfulImports,
        failedImports: bulkImport.failedImports,
        errors: bulkImport.errors,
        successfulRecords: bulkImport.successfulRecords,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Bulk import failed',
      error: error.message,
    });
  }
};

// Get Bulk Import Report
const getBulkImportReport = async (req, res) => {
  try {
    const { importId } = req.params;

    const bulkImport = await BulkImport.findById(importId).populate('importedBy');

    if (!bulkImport) {
      return res.status(404).json({
        success: false,
        message: 'Import record not found',
      });
    }

    res.status(200).json({
      success: true,
      data: bulkImport,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching import report',
      error: error.message,
    });
  }
};

// Get All Bulk Imports
const getBulkImports = async (req, res) => {
  try {
    const bulkImports = await BulkImport.find()
      .populate('importedBy')
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      data: bulkImports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bulk imports',
      error: error.message,
    });
  }
};

// Send Student Credentials Email
const sendStudentCredentialsEmail = async (email, firstName, studentId, password) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'AI-SDMS Account Created - Login Credentials',
      html: `
        <h2>Welcome to AI-SDMS!</h2>
        <p>Dear ${firstName},</p>
        <p>Your account has been created successfully. Here are your login credentials:</p>
        <p>
          <strong>Student ID:</strong> ${studentId}<br/>
          <strong>Email:</strong> ${email}<br/>
          <strong>Temporary Password:</strong> ${password}
        </p>
        <p><strong>Important:</strong> You must change your password on first login.</p>
        <p><a href="${process.env.FRONTEND_URL}/login">Click here to login</a></p>
        <p>If you have any questions, please contact the administration office.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    // Continue even if email fails
  }
};

module.exports = {
  bulkImportStudents,
  getBulkImportReport,
  getBulkImports,
  parseExcelFile,
  validateStudentRow,
};
