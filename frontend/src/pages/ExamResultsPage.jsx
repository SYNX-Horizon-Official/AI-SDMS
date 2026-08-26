import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import examApi from '../services/examApi';

const ExamResultsPage = () => {
  const { examId } = useParams();
  const [attempts, setAttempts] = useState([]);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExamAttempts();
  }, [examId]);

  const fetchExamAttempts = async () => {
    try {
      setLoading(true);
      const response = await examApi.getExamAttempts(examId);
      if (response.success) {
        setAttempts(response.data);
      }
    } catch (error) {
      console.error('Error fetching attempts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center text-gray-500 p-6">Loading results...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Exam Results</h1>

        {attempts.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">No attempts yet</div>
        ) : (
          <div className="grid gap-4">
            {attempts.map((attempt) => (
              <div key={attempt._id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800">{attempt.studentId?.name}</h3>
                    <p className="text-gray-600">ID: {attempt.studentId?.studentId}</p>
                    <p className="text-sm text-gray-500 mt-2">Submitted: {new Date(attempt.submittedAt).toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Duration: {attempt.totalDuration} minutes</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-blue-600">Score</p>
                    <p className="text-gray-500 text-sm">Pending Grading</p>
                  </div>
                </div>

                {attempt.focusLossCount > 0 || attempt.windowSwitchCount > 0 || attempt.tabSwitchCount > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-red-600 font-semibold">Security Violations Detected:</p>
                    <ul className="text-xs text-red-500 mt-2 space-y-1">
                      {attempt.focusLossCount > 0 && <li>• Focus Loss: {attempt.focusLossCount} times</li>}
                      {attempt.windowSwitchCount > 0 && <li>• Window Switch: {attempt.windowSwitchCount} times</li>}
                      {attempt.tabSwitchCount > 0 && <li>• Tab Switch: {attempt.tabSwitchCount} times</li>}
                    </ul>
                  </div>
                )}

                <button
                  onClick={() => setSelectedAttempt(selectedAttempt === attempt._id ? null : attempt._id)}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                >
                  {selectedAttempt === attempt._id ? 'Hide Details' : 'View Answers'}
                </button>

                {selectedAttempt === attempt._id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">MCQ Answers</h4>
                      {attempt.mcqAnswers.map((ans, idx) => (
                        <p key={idx} className="text-sm text-gray-700">Q{idx + 1}: {ans.selectedOption}</p>
                      ))}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Written Answers</h4>
                      {attempt.writtenAnswers.map((ans, idx) => (
                        <div key={idx} className="text-sm text-gray-700 mb-3 p-3 bg-gray-50 rounded">
                          <p className="font-semibold">Q{idx + 1}:</p>
                          <p>{ans.answerText}</p>
                        </div>
                      ))}
                    </div>
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

export default ExamResultsPage;
