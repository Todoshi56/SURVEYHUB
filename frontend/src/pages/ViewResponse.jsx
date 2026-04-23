import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ViewResponse() {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [surveyId]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch survey details
      const surveyRes = await axios.get(`http://localhost:5000/api/surveys/${surveyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSurvey(surveyRes.data);

      // Fetch user's response
      const responseRes = await axios.get(`http://localhost:5000/api/responses/user-response/${surveyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResponse(responseRes.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load response');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;
  if (!survey || !response) return <div className="container"><p className="error">Response not found</p></div>;

  return (
    <div className="container response-view">
      <button onClick={() => navigate('/surveys')} className="btn-back">← Back</button>

      <div className="response-header">
        <h1>{survey.title}</h1>
        <p className="response-meta">
          Submitted on {new Date(response.createdAt).toLocaleDateString()} at {new Date(response.createdAt).toLocaleTimeString()}
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="response-content">
        {response.answers && response.answers.map((answer, index) => (
          <div key={index} className="response-item">
            <h3 className="response-question">{index + 1}. {answer.questionText}</h3>
            <div className="response-answer">
              {Array.isArray(answer.answer) ? (
                answer.answer.map((ans, i) => <p key={i}>{ans}</p>)
              ) : (
                <p>{answer.answer}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="response-actions">
        <button onClick={() => navigate('/surveys')} className="btn btn-primary">
          Take Another Survey
        </button>
      </div>
    </div>
  );
}
