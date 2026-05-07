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
      const surveyRes = await axios.get(`http://localhost:5000/api/surveys/${id}`);
      setSurvey(surveyRes.data);

      if (token) {
        const checkRes = await axios.get(`http://localhost:5000/api/responses/check/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHasSubmitted(checkRes.data.hasSubmitted);
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

      navigate('/thank-you', { state: { surveyId: id } });
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
            <div style={{
              display:'flex', alignItems:'flex-start', gap:'10px', marginBottom:'8px'
            }}>
              <span style={{
                display:'inline-flex', alignItems:'center', justifyContent:'center',
                minWidth:'28px', height:'28px', borderRadius:'50%',
                background:'#4f46e5', color:'#fff',
                fontSize:'0.8rem', fontWeight:'700', flexShrink:0
              }}>
                {index + 1}
              </span>
              <span style={{fontSize:'1rem', fontWeight:'600', color:'#1e1e2e', lineHeight:'1.5'}}>
                {question.questionText}
                {question.required && <span style={{color:'#dc2626', marginLeft:'4px'}}>*</span>}
              </span>
            </div>

            {question.questionType === 'mcq' && (
              <div style={{display:'flex', flexDirection:'column', gap:'10px', marginTop:'10px'}}>
                {question.options.map((option, optIdx) => {
                  const isSelected = formData[question._id] === option;
                  return (
                    <label key={optIdx} style={{
                      display:'flex', alignItems:'center', gap:'12px',
                      padding:'12px 16px',
                      border: isSelected ? '2px solid #4f46e5' : '1.5px solid #ddd',
                      borderRadius:'10px',
                      cursor:'pointer',
                      background: isSelected ? '#eef2ff' : '#fff',
                      transition:'all 0.2s ease',
                      fontWeight: isSelected ? '600' : '400'
                    }}>
                      <input
                        type="radio"
                        name={question._id}
                        value={option}
                        onChange={(e) => handleInputChange(question._id, e.target.value)}
                        checked={isSelected}
                        disabled={hasSubmitted}
                        required={question.required}
                        style={{accentColor:'#4f46e5', width:'16px', height:'16px'}}
                      />
                      <span style={{
                        display:'inline-flex', alignItems:'center', justifyContent:'center',
                        width:'24px', height:'24px', borderRadius:'50%',
                        background: isSelected ? '#4f46e5' : '#f0f0f0',
                        color: isSelected ? '#fff' : '#555',
                        fontSize:'0.75rem', fontWeight:'700', flexShrink:0
                      }}>
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{option}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {question.questionType === 'rating' && (
              <div style={{marginTop:'10px'}}>
                <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
                  {[1,2,3,4,5].map((num) => {
                    const selected = formData[question._id] === num;
                    const getBg = (n) => {
                      if (n <= 2) return selected && n === num ? '#dc2626' : n === num ? '#fecaca' : '#fff5f5';
                      if (n === 3) return selected && n === num ? '#d97706' : n === num ? '#fde68a' : '#fffbeb';
                      return selected && n === num ? '#16a34a' : n === num ? '#bbf7d0' : '#f0fdf4';
                    };
                    const getBorder = (n) => {
                      if (n <= 2) return '#dc2626';
                      if (n === 3) return '#d97706';
                      return '#16a34a';
                    };
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleInputChange(question._id, num)}
                        disabled={hasSubmitted}
                        style={{
                          width:'52px', height:'52px',
                          borderRadius:'50%',
                          border: formData[question._id] === num
                            ? `2px solid ${getBorder(num)}`
                            : '1.5px solid #ddd',
                          background: formData[question._id] === num ? getBg(num) : '#f9f9f9',
                          fontWeight:'700', fontSize:'1.1rem',
                          cursor:'pointer',
                          transition:'all 0.2s ease',
                          transform: formData[question._id] === num ? 'scale(1.15)' : 'scale(1)'
                        }}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
                <p style={{fontSize:'0.78rem', color:'#888', marginTop:'8px'}}>
                  🔴 1–2 = Poor &nbsp;|&nbsp; 🟡 3 = Average &nbsp;|&nbsp; 🟢 4–5 = Excellent
                </p>
              </div>
            )}

            {question.questionType === 'text' && (
              <div style={{marginTop:'10px'}}>
                <textarea
                  value={formData[question._id] || ''}
                  onChange={(e) => handleInputChange(question._id, e.target.value)}
                  placeholder="✍️ Share your thoughts here..."
                  disabled={hasSubmitted}
                  required={question.required}
                  rows={4}
                  style={{
                    width:'100%', padding:'12px 14px',
                    border:'1.5px solid #ddd', borderRadius:'10px',
                    fontSize:'0.95rem', resize:'vertical',
                    fontFamily:'inherit', outline:'none',
                    transition:'border 0.2s',
                    boxSizing:'border-box'
                  }}
                  onFocus={(e) => e.target.style.border='1.5px solid #4f46e5'}
                  onBlur={(e) => e.target.style.border='1.5px solid #ddd'}
                />
                <p style={{fontSize:'0.75rem', color:'#aaa', textAlign:'right', margin:'4px 0 0 0'}}>
                  {(formData[question._id] || '').length} characters
                </p>
              </div>
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
