const Attendance = require('../models/attendance.model');
const User = require('../models/user.model');

// Mark attendance for multiple students for a given class session
exports.markAttendance = async (req, res) => {
  try {
    const { date, subjectId, batch, section, classTime, records, topic } = req.body;
    if (!date || !subjectId || !records || !Array.isArray(records)) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const ops = records.map(r => ({
      updateOne: {
        filter: { studentId: r.studentId, subject: subjectId, date: new Date(date) },
        update: {
          $set: {
            student: r.studentObjectId || null,
            studentId: r.studentId,
            batch,
            section,
            subject: subjectId,
            date: new Date(date),
            classTime,
            status: r.status,
            topic,
            recordedBy: req.user.id,
            updatedAt: new Date()
          }
        },
        upsert: true
      }
    }));

    await Attendance.bulkWrite(ops);
    return res.json({ message: 'Attendance recorded' });
  } catch (err) {
    console.error('markAttendance', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getAttendanceByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { from, to } = req.query;
    const q = { studentId };
    if (from || to) q.date = {};
    if (from) q.date.$gte = new Date(from);
    if (to) q.date.$lte = new Date(to);
    const records = await Attendance.find(q).populate('subject', 'name code').sort({ date: -1 });
    return res.json(records);
  } catch (err) {
    console.error('getAttendanceByStudent', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getAttendanceByClass = async (req, res) => {
  try {
    const { subjectId, date, batch, section } = req.query;
    if (!subjectId || !date) return res.status(400).json({ message: 'subjectId and date required' });
    const d = new Date(date);
    const records = await Attendance.find({ subject: subjectId, date: d, batch, section }).sort({ studentId: 1 });
    return res.json(records);
  } catch (err) {
    console.error('getAttendanceByClass', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.editAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, topic } = req.body;
    const rec = await Attendance.findByIdAndUpdate(id, { status, topic, updatedAt: new Date() }, { new: true });
    return res.json(rec);
  } catch (err) {
    console.error('editAttendance', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getAttendanceStats = async (req, res) => {
  try {
    const { studentId, subjectId } = req.query;
    if (!studentId) return res.status(400).json({ message: 'studentId required' });

    const match = { studentId };
    if (subjectId) match.subject = subjectId;

    const total = await Attendance.countDocuments(match);
    const present = await Attendance.countDocuments({ ...match, status: 'present' });

    const percentage = total === 0 ? 0 : Math.round((present / total) * 10000) / 100;
    return res.json({ total, present, percentage });
  } catch (err) {
    console.error('getAttendanceStats', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
