const Quiz = require('../models/quiz.model');
const QuizAttempt = require('../models/quizattempt.model');

// CREATE QUIZ
exports.createQuiz = async (req, res) => {
  try {
    const { title, description, subjectId, classroomId, duration, scheduledDate, scheduledTime } = req.body;

    const quiz = new Quiz({
      title,
      description,
      subjectId,
      classroomId,
      createdBy: req.user._id,
      duration,
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      published: false,
    });

    await quiz.save();
    res.status(201).json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ADD QUESTION TO QUIZ
exports.addQuestion = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { questionText, questionType, options, correctAnswer, marks } = req.body;

    const quiz = await Quiz.findByIdAndUpdate(
      quizId,
      {
        $push: {
          questions: { questionText, questionType, options, correctAnswer, marks },
        },
        $inc: { totalMarks: marks },
      },
      { new: true }
    );

    res.status(200).json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET QUIZ
exports.getQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId).populate('createdBy', 'name email');

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    res.status(200).json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET QUIZZES FOR CLASSROOM
exports.getQuizzesForClassroom = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const quizzes = await Quiz.find({ classroomId }).populate('createdBy', 'name email');
    res.status(200).json({ success: true, data: quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUBLISH QUIZ
exports.publishQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findByIdAndUpdate(
      quizId,
      { published: true },
      { new: true }
    );

    res.status(200).json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// SUBMIT QUIZ
exports.submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    let totalMarksObtained = 0;
    const processedAnswers = answers.map((answer) => {
      const question = quiz.questions.find((q) => q._id.toString() === answer.questionId);
      let isCorrect = false;
      let marksObtained = 0;

      if (question) {
        isCorrect = answer.studentAnswer === question.correctAnswer;
        marksObtained = isCorrect ? question.marks : 0;
        totalMarksObtained += marksObtained;
      }

      return {
        questionId: answer.questionId,
        studentAnswer: answer.studentAnswer,
        isCorrect,
        marksObtained,
      };
    });

    const quizAttempt = new QuizAttempt({
      quizId,
      studentId: req.user._id,
      answers: processedAnswers,
      totalMarksObtained,
    });

    await quizAttempt.save();
    res.status(201).json({ success: true, data: quizAttempt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET QUIZ ATTEMPTS (TEACHER)
exports.getQuizAttempts = async (req, res) => {
  try {
    const { quizId } = req.params;
    const attempts = await QuizAttempt.find({ quizId }).populate('studentId', 'name studentId email');
    res.status(200).json({ success: true, data: attempts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET MY QUIZ ATTEMPTS (STUDENT)
exports.getMyQuizAttempts = async (req, res) => {
  try {
    const { quizId } = req.params;
    const attempts = await QuizAttempt.find({ quizId, studentId: req.user._id });
    res.status(200).json({ success: true, data: attempts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUBLISH QUIZ RESULT
exports.publishQuizResult = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const attempt = await QuizAttempt.findByIdAndUpdate(
      attemptId,
      { published: true },
      { new: true }
    );

    res.status(200).json({ success: true, data: attempt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
