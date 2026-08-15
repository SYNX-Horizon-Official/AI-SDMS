const mongoose = require('mongoose');

const bulkImportSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    totalRecords: {
      type: Number,
      default: 0,
    },
    successfulImports: {
      type: Number,
      default: 0,
    },
    failedImports: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    importType: {
      type: String,
      enum: ['students', 'faculty', 'timetable'],
      required: true,
    },
    errors: [
      {
        rowNumber: Number,
        rowData: Object,
        errorMessage: String,
      },
    ],
    successfulRecords: [
      {
        email: String,
        id: String,
        password: String,
      },
    ],
    importedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HOD',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const BulkImport = mongoose.model('BulkImport', bulkImportSchema);

module.exports = BulkImport;
