const Exam = require('../models/exam.model');
const ExamAttempt = require('../models/examattempt.model');
const User = require('../models/user.model');
const fs = require('fs');
const path = require('path');

// CREATE EXAM
exports.createExam = async (req, res) => {
  try {
    const { title, examType, subjectId, batch, section, totalMarks, examDate, examStartTime, examDuration, mcqDuration, instructions } = req.body;

    const exam = new Exam({
      title,
      examType,
      subjectId,
      batch,
      section,
      createdBy: req.user._id,
      totalMarks,
      examDate: new Date(examDate),
      examStartTime,
      examDuration,
      mcqDuration,
      instructions,
      published: false,
      launched: false,
    });

    await exam.save();
    res.status(201).json({ success: true, data: exam });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ADD QUESTION TO EXAM
exports.addQuestion = async (req, res) => {
  try {
    const { examId } = req.params;
    const { questionText, questionType, options, marks, expectedAnswer, keywords, gradingCriteria } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    const questionNumber = exam.questions.length + 1;
    const question = {
      questionNumber,
      questionText,
      questionType,
      options: options || [],
      marks,
      expectedAnswer: expectedAnswer || '',
      keywords: keywords || [],
      gradingCriteria: gradingCriteria || '',
      orderInExam: questionNumber,
    };

    exam.questions.push(question);
    await exam.save();

    res.status(200).json({ success: true, data: exam });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// EDIT QUESTION
exports.editQuestion = async (req, res) => {
  try {
    const { examId, questionId } = req.params;
    const { questionText, questionType, options, marks, expectedAnswer, keywords, gradingCriteria } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    const question = exam.questions.id(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    question.questionText = questionText || question.questionText;
    question.questionType = questionType || question.questionType;
    question.options = options || question.options;
    question.marks = marks || question.marks;
    question.expectedAnswer = expectedAnswer || question.expectedAnswer;
    question.keywords = keywords || question.keywords;
    question.gradingCriteria = gradingCriteria || question.gradingCriteria;

    await exam.save();
    res.status(200).json({ success: true, data: exam });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE QUESTION
exports.deleteQuestion = async (req, res) => {
  try {
    const { examId, questionId } = req.params;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    exam.questions.id(questionId).remove();
    await exam.save();

    res.status(200).json({ success: true, data: exam });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET EXAM (Teacher view - with answers)
exports.getExamForTeacher = async (req, res) => {
  try {
    const { examId } = req.params;
    const exam = await Exam.findById(examId).populate('createdBy', 'name email');

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    res.status(200).json({ success: true, data: exam });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET EXAM (Student view - without answers)
exports.getExamForStudent = async (req, res) => {
  try {
    const { examId } = req.params;
    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    if (!exam.published || !exam.launched) {
      return res.status(403).json({ success: false, message: 'Exam not available yet' });
    }

    const studentExam = exam.toObject();
    studentExam.questions = studentExam.questions.map(q => ({
      _id: q._id,
      questionNumber: q.questionNumber,
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options || [],
      marks: q.marks,
      orderInExam: q.orderInExam,
    }));

    res.status(200).json({ success: true, data: studentExam });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUBLISH EXAM
exports.publishExam = async (req, res) => {
  try {
    const { examId } = req.params;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    if (exam.questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Exam must have at least one question' });
    }

    exam.published = true;
    await exam.save();

    res.status(200).json({ success: true, data: exam });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// LAUNCH EXAM
exports.launchExam = async (req, res) => {
  try {
    const { examId } = req.params;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    if (!exam.published) {
      return res.status(400).json({ success: false, message: 'Exam must be published before launching' });
    }

    exam.launched = true;
    exam.launchedAt = new Date();
    await exam.save();

    res.status(200).json({ success: true, data: exam });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// SUBMIT EXAM
exports.submitExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const { mcqAnswers, writtenAnswers, startTime, endTime, invigilatorName, invigilatorId } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    const student = await User.findById(req.user._id);

    const examAttempt = new ExamAttempt({
      examId,
      studentId: req.user._id,
      batch: student.batch || exam.batch,
      section: student.section || exam.section,
      rollNumber: student.rollNumber || student.studentId,
      mcqAnswers,
      writtenAnswers,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      totalDuration: (new Date(endTime) - new Date(startTime)) / 1000 / 60,
      submitted: true,
      submittedAt: new Date(),
      invigilatorName,
      invigilatorId,
    });

    await examAttempt.save();
    res.status(201).json({ success: true, data: examAttempt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET EXAM ATTEMPTS (Teacher)
exports.getExamAttempts = async (req, res) => {
  try {
    const { examId } = req.params;
    const attempts = await ExamAttempt.find({ examId }).populate('studentId', 'name studentId email batch section');
    res.status(200).json({ success: true, data: attempts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET STUDENT EXAM ATTEMPT
exports.getStudentAttempt = async (req, res) => {
  try {
    const { examId } = req.params;
    const attempt = await ExamAttempt.findOne({ examId, studentId: req.user._id });

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'No attempt found' });
    }

    res.status(200).json({ success: true, data: attempt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE INVIGILATOR RECORD
exports.updateInvigilator = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { invigilatorName, invigilatorId } = req.body;

    const attempt = await ExamAttempt.findByIdAndUpdate(
      attemptId,
      { invigilatorName, invigilatorId },
      { new: true }
    );

    res.status(200).json({ success: true, data: attempt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE FOCUS LOSS / SECURITY VIOLATIONS
exports.updateSecurityViolation = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { violationType } = req.body;

    const attempt = await ExamAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }

    if (violationType === 'focusLoss') {
      attempt.focusLossCount += 1;
    } else if (violationType === 'windowSwitch') {
      attempt.windowSwitchCount += 1;
    } else if (violationType === 'tabSwitch') {
      attempt.tabSwitchCount += 1;
    }

    await attempt.save();
    res.status(200).json({ success: true, data: attempt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
