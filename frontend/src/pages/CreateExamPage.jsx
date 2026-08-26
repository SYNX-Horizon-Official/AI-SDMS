import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import examApi from '../services/examApi';

const CreateExamPage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    examType: 'final',
    batch: '',
    section: '',
    totalMarks: 100,
    examDate: '',
    examStartTime: '',
    examDuration: 180,
    mcqDuration: 60,
    instructions: '',
  });
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [questionForm, setQuestionForm] = useState({
    questionText: '',
    questionType: 'mcq',
    options: ['', '', '', ''],
    marks: 1,
    expectedAnswer: '',
    keywords: [],
    gradingCriteria: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      const response = await examApi.createExam({
        ...formData,
        subjectId: 'placeholder',
      });
      if (response.success) {
        setExam(response.data);
      }
    } catch (error) {
      console.error('Error creating exam:', error);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      const response = await examApi.addQuestion(exam._id, questionForm);
      if (response.success) {
        setExam(response.data);
        setQuestionForm({
          questionText: '',
          questionType: 'mcq',
          options: ['', '', '', ''],
          marks: 1,
          expectedAnswer: '',
          keywords: [],
          gradingCriteria: '',
        });
        setShowAddQuestion(false);
      }
    } catch (error) {
      console.error('Error adding question:', error);
    }
  };

  const handlePublishExam = async () => {
    try {
      const response = await examApi.publishExam(exam._id);
      if (response.success) {
        setExam(response.data);
        alert('Exam published successfully!');
      }
    } catch (error) {
      console.error('Error publishing exam:', error);
    }
  };

  const handleLaunchExam = async () => {
    try {
      const response = await examApi.launchExam(exam._id);
      if (response.success) {
        setExam(response.data);
        alert('Exam launched! Students can now attempt it.');
      }
    } catch (error) {
      console.error('Error launching exam:', error);
    }
  };

  if (!exam) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">Create Exam</h1>
          <form onSubmit={handleCreateExam} className="bg-white p-6 rounded-lg shadow-md space-y-4">
            <input
              type="text"
              name="title"
              placeholder="Exam Title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              name="examType"
              value={formData.examType}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="final">Final Exam</option>
              <option value="midterm">Midterm</option>
              <option value="test">Test</option>
              <option value="improvement">Improvement</option>
            </select>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="batch"
                placeholder="Batch"
                value={formData.batch}
                onChange={handleInputChange}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                name="section"
                placeholder="Section"
                value={formData.section}
                onChange={handleInputChange}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                name="totalMarks"
                placeholder="Total Marks"
                value={formData.totalMarks}
                onChange={handleInputChange}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="date"
                name="examDate"
                value={formData.examDate}
                onChange={handleInputChange}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="time"
                name="examStartTime"
                value={formData.examStartTime}
                onChange={handleInputChange}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="number"
                name="examDuration"
                placeholder="Duration (minutes)"
                value={formData.examDuration}
                onChange={handleInputChange}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <input
              type="number"
              name="mcqDuration"
              placeholder="MCQ Duration (minutes)"
              value={formData.mcqDuration}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <textarea
              name="instructions"
              placeholder="Exam Instructions"
              value={formData.instructions}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold"
            >
              Create Exam
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{exam.title}</h1>
            <p className="text-gray-600 mt-2">Type: {exam.examType} | Total Marks: {exam.totalMarks}</p>
          </div>
          <div className="flex gap-2">
            {!exam.published && (
              <button
                onClick={handlePublishExam}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Publish
              </button>
            )}
            {exam.published && !exam.launched && (
              <button
                onClick={handleLaunchExam}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Launch Exam
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Total Questions</p>
            <p className="text-3xl font-bold text-blue-600">{exam.questions.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Status</p>
            <p className="text-lg font-bold text-gray-800">
              {exam.published ? (exam.launched ? '✓ Live' : '✓ Published') : 'Draft'}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Duration</p>
            <p className="text-2xl font-bold text-gray-800">{exam.examDuration} min</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddQuestion(!showAddQuestion)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 mb-6"
        >
          {showAddQuestion ? 'Cancel' : '+ Add Question'}
        </button>

        {showAddQuestion && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-semibold mb-4">Add Question</h2>
            <form onSubmit={handleAddQuestion} className="space-y-4">
              <textarea
                placeholder="Question Text"
                value={questionForm.questionText}
                onChange={(e) => setQuestionForm({ ...questionForm, questionText: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={questionForm.questionType}
                  onChange={(e) => setQuestionForm({ ...questionForm, questionType: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="mcq">MCQ</option>
                  <option value="short">Short Answer</option>
                  <option value="long">Long Answer</option>
                </select>
                <input
                  type="number"
                  placeholder="Marks"
                  value={questionForm.marks}
                  onChange={(e) => setQuestionForm({ ...questionForm, marks: parseInt(e.target.value) })}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              {questionForm.questionType === 'mcq' && (
                <div className="space-y-2">
                  <p className="font-semibold text-gray-700">Options</p>
                  {questionForm.options.map((option, idx) => (
                    <input
                      key={idx}
                      type="text"
                      placeholder={`Option ${idx + 1}`}
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...questionForm.options];
                        newOptions[idx] = e.target.value;
                        setQuestionForm({ ...questionForm, options: newOptions });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  ))}
                </div>
              )}
              <textarea
                placeholder="Expected Answer / Keywords"
                value={questionForm.expectedAnswer}
                onChange={(e) => setQuestionForm({ ...questionForm, expectedAnswer: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows="2"
              />
              <textarea
                placeholder="Grading Criteria"
                value={questionForm.gradingCriteria}
                onChange={(e) => setQuestionForm({ ...questionForm, gradingCriteria: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows="2"
              />
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-semibold"
              >
                Add Question
              </button>
            </form>
          </div>
        )}

        {exam.questions.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">Questions</h2>
            {exam.questions.map((question, idx) => (
              <div key={question._id} className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">
                      Q{idx + 1}: {question.questionText}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">Type: {question.questionType} | Marks: {question.marks}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateExamPage;
