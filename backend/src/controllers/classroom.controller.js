const Classroom = require('../models/classroom.model');
const LectureFile = require('../models/lecturefile.model');
const storage = require('../services/storage.service');
const path = require('path');
const fs = require('fs');

exports.createClassroom = async (req, res) => {
  try {
    const { title, code, batch, section, subjectId, teacherIds = [] } = req.body;
    const cls = await Classroom.create({ title, code, batch, section, subject: subjectId, teachers: teacherIds });
    return res.json(cls);
  } catch (err) {
    console.error('createClassroom', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getClassroom = async (req, res) => {
  try {
    const { id } = req.params;
    const cls = await Classroom.findById(id).populate('teachers', 'name employeeId email').populate('students', 'name studentId email');
    if (!cls) return res.status(404).json({ message: 'Classroom not found' });
    return res.json(cls);
  } catch (err) {
    console.error('getClassroom', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.listForUser = async (req, res) => {
  try {
    const user = req.user;
    let q = {};
    if (user.role === 'student') q.students = user.id;
    else if (user.role === 'faculty') q.teachers = user.id;
    // HOD/admin see all
    const list = await Classroom.find(q).limit(200).sort({ createdAt: -1 });
    return res.json(list);
  } catch (err) {
    console.error('listForUser', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.enrollStudent = async (req, res) => {
  try {
    const { id } = req.params; // classroom id
    const { studentId } = req.body; // user id
    const cls = await Classroom.findById(id);
    if (!cls) return res.status(404).json({ message: 'Classroom not found' });
    if (!cls.students.includes(studentId)) {
      cls.students.push(studentId);
      await cls.save();
    }
    return res.json({ message: 'Enrolled' });
  } catch (err) {
    console.error('enrollStudent', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.listFiles = async (req, res) => {
  try {
    const { id } = req.params;
    const files = await LectureFile.find({ classroom: id }).sort({ createdAt: -1 });
    return res.json(files);
  } catch (err) {
    console.error('listFiles', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const { id, fileId } = req.params; // classroom id + file id
    const f = await LectureFile.findById(fileId);
    if (!f) return res.status(404).json({ message: 'File not found' });
    const fp = path.resolve(f.path);
    if (!fs.existsSync(fp)) return res.status(404).json({ message: 'File missing on disk' });
    res.download(fp, f.originalName);
  } catch (err) {
    console.error('downloadFile', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
