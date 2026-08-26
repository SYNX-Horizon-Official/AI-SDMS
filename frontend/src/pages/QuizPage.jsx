import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import quizApi from '../services/quizApi';

const QuizPage = () => {
  const { classroomId } = useParams();
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 30,
    scheduledDate: '',
    scheduledTime: '',
  });
  const [loading, setLoading] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  useEffect(() => {
    fetchQuizzes();
  }, [classroomId]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await quizApi.getQuizzesForClassroom(classroomId);
      if (response.success) {
        setQuizzes(response.data);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    try {
      const response = await quizApi.createQuiz({
        ...formData,
        classroomId,
        subjectId: 'placeholder',
      });

      if (response.success) {
        setQuizzes([...quizzes, response.data]);
        setShowCreateForm(false);
        setFormData({
          title: '',
          description: '',
          duration: 30,
          scheduledDate: '',
          scheduledTime: '',
        });
      }
    } catch (error) {
      console.error('Error creating quiz:', error);
    }
  };

  const handlePublish = async (quizId) => {
    try {
      const response = await quizApi.publishQuiz(quizId);
      if (response.success) {
        setQuizzes(quizzes.map(q => q._id === quizId ? response.data : q));
      }
    } catch (error) {
      console.error('Error publishing quiz:', error);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Quizzes</h1>
          {['faculty', 'hod'].includes(user?.role) && (
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              {showCreateForm ? 'Cancel' : 'Create Quiz'}
            </button>
          )}
        </div>

        {showCreateForm && ['faculty', 'hod'].includes(user?.role) && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-semibold mb-4">Create New Quiz</h2>
            <form onSubmit={handleCreateQuiz} className="space-y-4">
              <input
                type="text"
                name="title"
                placeholder="Quiz Title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="number"
                  name="duration"
                  placeholder="Duration (minutes)"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="date"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleInputChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="time"
                  name="scheduledTime"
                  value={formData.scheduledTime}
                  onChange={handleInputChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-semibold"
              >
                Create Quiz
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-500">Loading quizzes...</div>
        ) : quizzes.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No quizzes available</div>
        ) : (
          <div className="grid gap-4">
            {quizzes.map((quiz) => (
              <div key={quiz._id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800">{quiz.title}</h3>
                    <p className="text-gray-600 mt-2">{quiz.description}</p>
                    <div className="mt-3 flex gap-4 text-sm text-gray-500">
                      <span>⏱️ {quiz.duration} minutes</span>
                      <span>⭐ {quiz.totalMarks} marks</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    quiz.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {quiz.published ? 'Published' : 'Draft'}
                  </span>
                </div>

                {['faculty', 'hod'].includes(user?.role) && (
                  <div className="mt-4 flex gap-2">
                    {!quiz.published && (
                      <button
                        onClick={() => handlePublish(quiz._id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                      >
                        Publish
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedQuiz(quiz._id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                    >
                      Manage Questions
                    </button>
                  </div>
                )}

                {user?.role === 'student' && quiz.published && (
                  <div className="mt-4">
                    <button
                      onClick={() => alert(`Start quiz: ${quiz.title}`)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Start Quiz
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
