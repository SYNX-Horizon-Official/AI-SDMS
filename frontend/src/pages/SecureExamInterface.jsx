import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import examApi from '../services/examApi';

const SecureExamInterface = () => {
  const { examId } = useParams();
  const { user } = useAuth();
  const [exam, setExam] = useState(null);
  const [phase, setPhase] = useState('terms'); // terms, mcq, written, review, submitted
  const [loading, setLoading] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [totalTimer, setTotalTimer] = useState(null);
  const [mcqTimer, setMcqTimer] = useState(null);
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [writtenAnswers, setWrittenAnswers] = useState({});
  const [focusLossCount, setFocusLossCount] = useState(0);
  const [windowSwitchCount, setWindowSwitchCount] = useState(0);
  const [attemptId, setAttemptId] = useState(null);

  useEffect(() => {
    fetchExam();
  }, [examId]);

  useEffect(() => {
    // Fullscreen on exam start
    if (phase === 'mcq' || phase === 'written') {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Fullscreen request denied:', err);
      });
    }
  }, [phase]);

  useEffect(() => {
    // Prevent tab switching, window switching
    if (phase === 'mcq' || phase === 'written') {
      const handleVisibilityChange = () => {
        if (document.hidden) {
          setWindowSwitchCount((prev) => prev + 1);
          handleSecurityViolation('windowSwitch');
        }
      };

      const handleKeyDown = (e) => {
        // Prevent F5, F11, Alt+Tab
        if (
          e.key === 'F5' ||
          e.key === 'F11' ||
          (e.altKey && e.key === 'Tab')
        ) {
          e.preventDefault();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [phase]);

  useEffect(() => {
    // Total timer countdown
    if (phase === 'mcq' || phase === 'written') {
      const interval = setInterval(() => {
        setTotalTimer((prev) => {
          if (prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [phase]);

  useEffect(() => {
    // MCQ timer countdown
    if (phase === 'mcq' && mcqTimer !== null) {
      const interval = setInterval(() => {
        setMcqTimer((prev) => {
          if (prev <= 1) {
            setPhase('written');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [phase, mcqTimer]);

  const fetchExam = async () => {
    try {
      setLoading(true);
      const response = await examApi.getExamForStudent(examId);
      if (response.success) {
        setExam(response.data);
        const mcqQuestions = response.data.questions.filter((q) => q.questionType === 'mcq');
        const totalMinutes = response.data.examDuration;
        const mcqMinutes = response.data.mcqDuration || Math.ceil(mcqQuestions.length * 2);

        setTotalTimer(totalMinutes * 60);
        setMcqTimer(mcqMinutes * 60);
      }
    } catch (error) {
      console.error('Error fetching exam:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSecurityViolation = async (violationType) => {
    if (attemptId) {
      await examApi.updateSecurityViolation(attemptId, violationType);
    }
  };

  const handleStartExam = () => {
    if (!termsAccepted) {
      alert('You must accept the terms and conditions to proceed');
      return;
    }
    setStartTime(new Date());
    setPhase('mcq');
    setAttemptId('temp-' + Date.now()); // Placeholder
  };

  const handleMcqAnswer = (questionId, answer) => {
    setMcqAnswers({ ...mcqAnswers, [questionId]: answer });
  };

  const handleFinishMcqPhase = () => {
    setPhase('written');
  };

  const handleWrittenAnswer = (questionId, answer) => {
    setWrittenAnswers({ ...writtenAnswers, [questionId]: answer });
  };

  const handleSubmitExam = async () => {
    try {
      const submission = {
        mcqAnswers: Object.entries(mcqAnswers).map(([questionId, answer]) => ({
          questionId,
          selectedOption: answer,
        })),
        writtenAnswers: Object.entries(writtenAnswers).map(([questionId, answerText]) => ({
          questionId,
          answerText,
        })),
        startTime,
        endTime: new Date(),
        invigilatorName: 'System Auto-Submission',
        invigilatorId: null,
      };

      const response = await examApi.submitExam(examId, submission);
      if (response.success) {
        setPhase('submitted');
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (loading) return <div className="text-center text-gray-500 p-6">Loading exam...</div>;

  if (phase === 'terms') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">Exam Terms & Conditions</h1>
          <div className="bg-gray-50 p-6 rounded-lg mb-6 max-h-96 overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Rules & Regulations</h2>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>✓ You must maintain full-screen mode throughout the exam</li>
              <li>✓ Switching windows or tabs will be recorded as a violation</li>
              <li>✓ Do not press F5 (Refresh), F11 (Fullscreen toggle), or Alt+Tab</li>
              <li>✓ Loss of focus/window switching will be monitored and recorded</li>
              <li>✓ Copy/Paste is disabled during the exam</li>
              <li>✓ You have {exam?.examDuration} minutes to complete the exam</li>
              <li>✓ Your answers will be auto-saved at regular intervals</li>
              <li>✓ Exam cannot be paused once started</li>
              <li>✓ Internet disconnection will save your current progress</li>
              <li>✓ You agree to follow academic integrity guidelines</li>
            </ul>
          </div>
          <div className="flex items-center mb-6">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="terms" className="ml-2 text-gray-700">
              I agree to the above terms and conditions
            </label>
          </div>
          <button
            onClick={handleStartExam}
            disabled={!termsAccepted}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
          >
            Start Exam
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'submitted') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="text-6xl mb-4">✓</div>
          <h1 className="text-3xl font-bold mb-2 text-green-600">Exam Submitted</h1>
          <p className="text-gray-600 mb-4">Your exam has been successfully submitted</p>
          <p className="text-gray-500 text-sm">Your answer sheet is now with the examiner for evaluation</p>
        </div>
      </div>
    );
  }

  const mcqQuestions = exam?.questions.filter((q) => q.questionType === 'mcq') || [];
  const writtenQuestions = exam?.questions.filter((q) => q.questionType !== 'mcq') || [];

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      {/* Header with Timer */}
      <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">{exam?.title}</h1>
          <p className="text-sm">Phase: {phase === 'mcq' ? 'MCQ' : 'Written Questions'}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-mono font-bold">{formatTime(totalTimer || 0)}</p>
          <p className="text-xs">Total Time Remaining</p>
          {phase === 'mcq' && mcqTimer && (
            <>
              <p className="text-xl font-mono font-bold mt-2" style={{ color: mcqTimer < 300 ? '#ff6b6b' : '#fff' }}>
                {formatTime(mcqTimer)}
              </p>
              <p className="text-xs">MCQ Phase</p>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {phase === 'mcq' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Multiple Choice Questions</h2>
              <div className="space-y-6">
                {mcqQuestions.map((question, index) => (
                  <div key={question._id} className="bg-white p-6 rounded-lg shadow-md">
                    <p className="font-semibold text-lg mb-4 text-gray-800">
                      {index + 1}. {question.questionText}
                    </p>
                    <div className="space-y-3">
                      {question.options.map((option, optIndex) => (
                        <label key={optIndex} className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name={question._id}
                            value={option}
                            checked={mcqAnswers[question._id] === option}
                            onChange={() => handleMcqAnswer(question._id, option)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="ml-3 text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex justify-end gap-4">
                <button
                  onClick={handleFinishMcqPhase}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold"
                >
                  Finish MCQ & Move to Written
                </button>
              </div>
            </div>
          )}

          {phase === 'written' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Written Questions</h2>
              <div className="space-y-6">
                {writtenQuestions.map((question, index) => (
                  <div key={question._id} className="bg-white p-6 rounded-lg shadow-md">
                    <p className="font-semibold text-lg mb-4 text-gray-800">
                      {mcqQuestions.length + index + 1}. {question.questionText}
                    </p>
                    <p className="text-sm text-gray-500 mb-3">Marks: {question.marks}</p>
                    <textarea
                      placeholder="Type your answer here..."
                      value={writtenAnswers[question._id] || ''}
                      onChange={(e) => handleWrittenAnswer(question._id, e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="6"
                      onCopy={(e) => e.preventDefault()}
                      onCut={(e) => e.preventDefault()}
                      onPaste={(e) => e.preventDefault()}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-8 flex justify-end gap-4">
                <button
                  onClick={handleSubmitExam}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-semibold"
                >
                  Submit Exam
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecureExamInterface;
