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

  const isOptionSelected = (value, option) => value === option;

  if (loading) return <div className="container"><p>Loading...</p></div>;
  if (!survey || !response) return <div className="container"><p className="error">Response not found</p></div>;

  return (
    <div className="container response-view">
      <button onClick={() => navigate('/surveys')} className="btn-back">← Back</button>

      <div style={{
        background:'linear-gradient(135deg, #4f46e5, #7c3aed)',
        borderRadius:'14px', padding:'24px', marginBottom:'24px', color:'#fff'
      }}>
        <p style={{margin:'0 0 4px 0', fontSize:'0.82rem', opacity:0.8, fontWeight:'500'}}>
          📋 YOUR SUBMITTED RESPONSE
        </p>
        <h1 style={{margin:'0 0 8px 0', fontSize:'1.5rem', fontWeight:'800'}}>
          {survey.title}
        </h1>
        {survey.description && (
          <p style={{margin:'0 0 12px 0', opacity:0.85, fontSize:'0.9rem'}}>
            {survey.description}
          </p>
        )}
        <div style={{
          background:'rgba(255,255,255,0.2)', borderRadius:'8px',
          padding:'8px 14px', display:'inline-block',
          fontSize:'0.82rem', fontWeight:'600'
        }}>
          🗓️ Submitted on {new Date(response.createdAt).toLocaleDateString()} at {new Date(response.createdAt).toLocaleTimeString()}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="response-content">
        {survey.questions.map((question, index) => {
          const answerObj = response.answers?.find(a => a.questionId === question._id);
          const value = answerObj?.answer;
          return (
            <div key={question._id} style={{
              background:'#fff', border:'1.5px solid #e5e7eb',
              borderRadius:'12px', padding:'20px', marginBottom:'16px'
            }}>
              <div style={{display:'flex', gap:'10px', alignItems:'flex-start', marginBottom:'14px'}}>
                <span style={{
                  display:'inline-flex', alignItems:'center', justifyContent:'center',
                  minWidth:'28px', height:'28px', borderRadius:'50%',
                  background:'#4f46e5', color:'#fff',
                  fontSize:'0.78rem', fontWeight:'700', flexShrink:0
                }}>
                  {index + 1}
                </span>
                <h3 style={{margin:0, fontSize:'0.98rem', fontWeight:'700', color:'#1e1e2e'}}>
                  {question.questionText}
                  {question.required && <span style={{color:'#dc2626', marginLeft:'4px'}}>*</span>}
                </h3>
              </div>

              {question.questionType === 'mcq' && (
                <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
                  {question.options.map((option, oi) => {
                    const selected = isOptionSelected(value, option);
                    return (
                      <div key={oi} style={{
                        display:'flex', alignItems:'center', gap:'12px',
                        padding:'10px 14px', borderRadius:'8px',
                        background: selected ? '#eef2ff' : '#f9fafb',
                        border: selected ? '1.5px solid #4f46e5' : '1.5px solid #e5e7eb',
                        fontWeight: selected ? '600' : '400',
                        color: selected ? '#4f46e5' : '#555'
                      }}>
                        <span style={{
                          display:'inline-flex', alignItems:'center', justifyContent:'center',
                          width:'22px', height:'22px', borderRadius:'50%',
                          background: selected ? '#4f46e5' : '#e5e7eb',
                          color: selected ? '#fff' : '#888',
                          fontSize:'0.7rem', fontWeight:'700', flexShrink:0
                        }}>
                          {String.fromCharCode(65 + oi)}
                        </span>
                        <span>{option}</span>
                        {selected && <span style={{marginLeft:'auto', fontSize:'0.8rem'}}>✓ Selected</span>}
                      </div>
                    );
                  })}
                </div>
              )}

              {question.questionType === 'rating' && (
                <div>
                  <div style={{display:'flex', gap:'8px', alignItems:'center', marginBottom:'8px'}}>
                    {[1,2,3,4,5].map((num) => {
                      const isSelected = Number(value) === num;
                      const isPast = Number(value) >= num;
                      return (
                        <span key={num} style={{
                          display:'inline-flex', alignItems:'center', justifyContent:'center',
                          width:'44px', height:'44px', borderRadius:'50%',
                          background: isPast ? (num<=2 ? '#fecaca' : num===3 ? '#fde68a' : '#bbf7d0') : '#f3f4f6',
                          border: isSelected ? '2px solid #333' : '1.5px solid #e5e7eb',
                          fontWeight:'700', fontSize:'1rem',
                          transform: isSelected ? 'scale(1.2)' : 'scale(1)'
                        }}>
                          {num}
                        </span>
                      );
                    })}
                    <span style={{
                      marginLeft:'12px', padding:'4px 12px',
                      background: Number(value)>=4 ? '#dcfce7' : Number(value)===3 ? '#fef9c3' : '#fee2e2',
                      color: Number(value)>=4 ? '#16a34a' : Number(value)===3 ? '#854d0e' : '#dc2626',
                      borderRadius:'20px', fontWeight:'700', fontSize:'0.85rem'
                    }}>
                      {value ? `${value} / 5` : 'No answer'}
                    </span>
                  </div>
                  <p style={{fontSize:'0.75rem', color:'#9ca3af', margin:0}}>
                    🔴 1–2 Poor &nbsp;|&nbsp; 🟡 3 Average &nbsp;|&nbsp; 🟢 4–5 Excellent
                  </p>
                </div>
              )}

              {question.questionType === 'text' && (
                <div style={{
                  background:'#f8fafc', borderRadius:'8px',
                  padding:'14px 16px', border:'1px solid #e5e7eb'
                }}>
                  {value ? (
                    <p style={{margin:0, color:'#374151', lineHeight:'1.7', fontSize:'0.95rem'}}>
                      💬 {value}
                    </p>
                  ) : (
                    <p style={{margin:0, color:'#9ca3af', fontStyle:'italic', fontSize:'0.9rem'}}>
                      No answer provided
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="response-actions">
        <button onClick={() => navigate('/surveys')} className="btn btn-primary">
          Take Another Survey
        </button>
      </div>
    </div>
  );
}
