const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const getToken = () => localStorage.getItem('token');

const examApi = {
  createExam: async (examData) => {
    const response = await fetch(`${API_URL}/exams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(examData),
    });
    return response.json();
  },

  addQuestion: async (examId, questionData) => {
    const response = await fetch(`${API_URL}/exams/${examId}/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(questionData),
    });
    return response.json();
  },

  editQuestion: async (examId, questionId, questionData) => {
    const response = await fetch(`${API_URL}/exams/${examId}/questions/${questionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(questionData),
    });
    return response.json();
  },

  deleteQuestion: async (examId, questionId) => {
    const response = await fetch(`${API_URL}/exams/${examId}/questions/${questionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return response.json();
  },

  getExamForTeacher: async (examId) => {
    const response = await fetch(`${API_URL}/exams/${examId}/teacher`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return response.json();
  },

  getExamForStudent: async (examId) => {
    const response = await fetch(`${API_URL}/exams/${examId}/student`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return response.json();
  },

  publishExam: async (examId) => {
    const response = await fetch(`${API_URL}/exams/${examId}/publish`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return response.json();
  },

  launchExam: async (examId) => {
    const response = await fetch(`${API_URL}/exams/${examId}/launch`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return response.json();
  },

  submitExam: async (examId, submissionData) => {
    const response = await fetch(`${API_URL}/exams/${examId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(submissionData),
    });
    return response.json();
  },

  getExamAttempts: async (examId) => {
    const response = await fetch(`${API_URL}/exams/${examId}/attempts`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return response.json();
  },

  getStudentAttempt: async (examId) => {
    const response = await fetch(`${API_URL}/exams/${examId}/my-attempt`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return response.json();
  },

  updateSecurityViolation: async (attemptId, violationType) => {
    const response = await fetch(`${API_URL}/exams/attempts/${attemptId}/violation`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ violationType }),
    });
    return response.json();
  },
};

export default examApi;
