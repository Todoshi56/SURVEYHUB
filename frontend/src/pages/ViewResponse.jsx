import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function ViewResponse() {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [survey, setSurvey] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [surveyId]);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${user.token}` };

      const surveyRes = await axios.get(`/api/surveys/${surveyId}`, { headers });
      setSurvey(surveyRes.data);

      const responseRes = await axios.get(`/api/responses/user-response/${surveyId}`, { headers });
      setResponse(responseRes.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load response');
    } finally {
      setLoading(false);
    }
  };

  const findAnswer = (questionId) =>
    response?.answers.find((a) => a.questionId === questionId.toString());

  const isOptionSelected = (selectedAnswer, option) => {
    if (Array.isArray(selectedAnswer)) return selectedAnswer.includes(option);
    return selectedAnswer === option;
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;
  if (!survey || !response) return <div className="container"><p className="error">Response not found</p></div>;

  return (
    <div className="container response-view">
      <button onClick={() => navigate('/surveys')} className="btn-back">← Back</button>

      <div className="response-header">
        <h1>{survey.title}</h1>
        {survey.description && <p className="description">{survey.description}</p>}
        <p className="response-meta">
          Submitted on {new Date(response.createdAt).toLocaleDateString()} at {new Date(response.createdAt).toLocaleTimeString()}
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="response-content">
        {survey.questions.map((question, index) => {
          const answer = findAnswer(question._id);
          const value = answer?.answer;

          return (
            <div key={question._id} className="response-item">
              <h3 className="response-question">
                {index + 1}. {question.questionText}
                {question.required && <span className="required"> *</span>}
              </h3>

              {question.questionType === 'mcq' && (
                <div className="response-options">
                  {question.options.map((option, oi) => {
                    const selected = isOptionSelected(value, option);
                    return (
                      <div
                        key={oi}
                        className={`response-option ${selected ? 'selected' : ''}`}
                      >
                        <span className="option-marker">{selected ? '●' : '○'}</span>
                        <span>{option}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {question.questionType === 'rating' && (
                <div className="response-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${Number(value) >= star ? 'active' : ''}`}
                    >
                      ★
                    </span>
                  ))}
                  <span className="rating-value">
                    {value ? `${value} / 5` : 'No answer'}
                  </span>
                </div>
              )}

              {question.questionType === 'text' && (
                <div className="response-text">
                  {value ? <p>{value}</p> : <p className="empty-text">No answer</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="response-actions">
        <button onClick={() => navigate('/surveys')} className="btn btn-primary">
          Back to Surveys
        </button>
      </div>
    </div>
  );
}
