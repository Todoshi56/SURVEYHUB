import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function SurveyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({});
  const [hasApprovedSample, setHasApprovedSample] = useState(false);

  useEffect(() => {
    fetchSurveyAndCheck();
  }, [id]);

  const fetchSurveyAndCheck = async () => {
    try {
      const surveyRes = await axios.get(`/api/surveys/${id}`);
      setSurvey(surveyRes.data);

      if (user?.token) {
        const headers = { Authorization: `Bearer ${user.token}` };
        const [checkRes, requestsRes] = await Promise.all([
          axios.get(`/api/responses/check/${id}`, { headers }),
          axios.get('/api/sample-requests/mine', { headers })
        ]);
        if (checkRes.data.hasSubmitted) {
          navigate(`/response/${id}`, { replace: true });
          return;
        }
        const productId = surveyRes.data.product?._id || surveyRes.data.product;
        const approved = requestsRes.data.some(
          (r) => r.status === 'approved' && r.product?._id === productId
        );
        setHasApprovedSample(approved);
      }
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
    setSubmitting(true);
    try {
      const answers = survey.questions.map(q => ({
        questionId: q._id,
        questionText: q.questionText,
        answer: formData[q._id]
      }));

      await axios.post('/api/responses/submit', {
        surveyId: id,
        answers
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      navigate('/thank-you', { state: { surveyId: id } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit survey');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container"><p>Loading survey...</p></div>;
  if (!survey) return <div className="container"><p className="error">Survey not found</p></div>;

  const surveyCompanyId = survey.company?._id || survey.company;
  const isOwnCompany =
    user?.role === 'company' &&
    user?.companyId &&
    surveyCompanyId &&
    String(surveyCompanyId) === String(user.companyId);

  return (
    <div className="container survey-detail">
      <button onClick={() => navigate('/surveys')} className="btn-back">← Back</button>
      {survey.product?.image && (
        <img
          src={survey.product.image}
          alt={survey.product.name}
          className="survey-product-image"
        />
      )}
      <h1>{survey.title}</h1>
      {survey.product?.name && (
        <p className="product-name">Product: {survey.product.name}</p>
      )}
      <p className="description">{survey.description}</p>

      {error && <div className="alert alert-error">{error}</div>}

      {isOwnCompany ? (
        <div className="alert alert-warning">
          You can't take this survey — it belongs to your own company
          {survey.company?.companyName ? ` (${survey.company.companyName})` : ''}.
        </div>
      ) : !hasApprovedSample ? (
        <div className="alert alert-warning">
          You can take this survey only after the company approves your sample request for this product.{' '}
          <Link to="/products">Browse products</Link> to request a sample.
        </div>
      ) : (
      <form onSubmit={handleSubmit}>
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
                required={question.required}
              />
            )}
          </div>
        ))}

        <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Survey'}
        </button>
      </form>
      )}
    </div>
  );
}
