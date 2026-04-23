import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function SurveyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchSurveyAndCheck();
  }, [id]);

  const fetchSurveyAndCheck = async () => {
    try {
      const token = localStorage.getItem('token');
      const surveyRes = await axios.get(`http://localhost:5000/api/surveys/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSurvey(surveyRes.data);

      // Check if user already submitted
      const checkRes = await axios.get(`http://localhost:5000/api/responses/check/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHasSubmitted(checkRes.data.hasSubmitted);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load survey');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (questionId, value) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (hasSubmitted) {
      setError('You have already submitted this survey');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const answers = survey.questions.map(q => ({
        questionId: q._id,
        questionText: q.questionText,
        answer: formData[q._id]
      }));

      await axios.post('http://localhost:5000/api/responses/submit', {
        surveyId: id,
        answers
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Survey submitted successfully!');
      navigate('/surveys');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit survey');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container"><p>Loading survey...</p></div>;
  if (!survey) return <div className="container"><p className="error">Survey not found</p></div>;

  return (
    <div className="container survey-detail">
      <button onClick={() => navigate('/surveys')} className="btn-back">← Back</button>
      <h1>{survey.title}</h1>
      <p className="description">{survey.description}</p>

      {hasSubmitted && (
        <div className="alert alert-warning">
          You have already submitted this survey. You cannot submit it again.
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} disabled={hasSubmitted}>
        {survey.questions.map((question, index) => (
          <div key={question._id} className="question-group">
            <label>{index + 1}. {question.questionText} {question.required && <span className="required">*</span>}</label>

            {question.questionType === 'mcq' && (
              <div className="options">
                {question.options.map((option, optIdx) => (
                  <label key={optIdx} className="radio-label">
                    <input
                      type="radio"
                      name={question._id}
                      value={option}
                      onChange={(e) => handleInputChange(question._id, e.target.value)}
                      checked={formData[question._id] === option}
                      disabled={hasSubmitted}
                      required={question.required}
                    />
                    {option}
                  </label>
                ))}
              </div>
            )}

            {question.questionType === 'rating' && (
              <div className="rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star ${formData[question._id] >= star ? 'active' : ''}`}
                    onClick={() => handleInputChange(question._id, star)}
                    disabled={hasSubmitted}
                  >
                    ★
                  </button>
                ))}
              </div>
            )}

            {question.questionType === 'text' && (
              <textarea
                value={formData[question._id] || ''}
                onChange={(e) => handleInputChange(question._id, e.target.value)}
                placeholder="Your answer"
                disabled={hasSubmitted}
                required={question.required}
              />
            )}
          </div>
        ))}

        <button type="submit" className="btn btn-primary btn-full" disabled={hasSubmitted || submitting}>
          {submitting ? 'Submitting...' : 'Submit Survey'}
        </button>
      </form>
    </div>
  );
}
