const Attendance = require('../models/attendance.model');

exports.calculateSubjectPercentage = async (studentId, subjectId) => {
  const match = { studentId };
  if (subjectId) match.subject = subjectId;
  const total = await Attendance.countDocuments(match);
  const present = await Attendance.countDocuments({ ...match, status: 'present' });
  const percentage = total === 0 ? 0 : (present / total) * 100;
  return { total, present, percentage };
};

exports.isEligibleForExam = async (studentId, subjectId, threshold = 75) => {
  const { percentage } = await exports.calculateSubjectPercentage(studentId, subjectId);
  return percentage >= threshold;
};
