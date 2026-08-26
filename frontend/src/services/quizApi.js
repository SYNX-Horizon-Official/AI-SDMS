const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const getToken = () => localStorage.getItem('token');

const quizApi = {
  createQuiz: async (quizData) => {
    const response = await fetch(`${API_URL}/quizzes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(quizData),
    });
    return response.json();
  },

  addQuestion: async (quizId, questionData) => {
    const response = await fetch(`${API_URL}/quizzes/${quizId}/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(questionData),
    });
    return response.json();
  },

  getQuiz: async (quizId) => {
    const response = await fetch(`${API_URL}/quizzes/${quizId}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return response.json();
  },

  getQuizzesForClassroom: async (classroomId) => {
    const response = await fetch(`${API_URL}/quizzes/classroom/${classroomId}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return response.json();
  },

  publishQuiz: async (quizId) => {
    const response = await fetch(`${API_URL}/quizzes/${quizId}/publish`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return response.json();
  },

  submitQuiz: async (quizId, answers) => {
    const response = await fetch(`${API_URL}/quizzes/${quizId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ answers }),
    });
    return response.json();
  },

  getQuizAttempts: async (quizId) => {
    const response = await fetch(`${API_URL}/quizzes/${quizId}/attempts`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return response.json();
  },

  getMyQuizAttempts: async (quizId) => {
    const response = await fetch(`${API_URL}/quizzes/${quizId}/my-attempts`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return response.json();
  },

  publishQuizResult: async (attemptId) => {
    const response = await fetch(`${API_URL}/quizzes/attempts/${attemptId}/publish`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return response.json();
  },
};

export default quizApi;
