import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function SurveysBrowse() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchActiveSurveys();
  }, []);

  const fetchActiveSurveys = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/surveys/browse/active', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSurveys(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load surveys');
      setSurveys([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container"><p>Loading surveys...</p></div>;

  return (
    <div className="container">
      <div style={{
        display:'flex', justifyContent:'space-between',
        alignItems:'center', marginBottom:'24px',
        paddingBottom:'16px', borderBottom:'2px solid #f0f0f0'
      }}>
        <div>
          <h1 style={{margin:0, fontSize:'1.8rem', color:'#1e1e2e'}}>
            📋 Available Surveys
          </h1>
          <p style={{margin:'4px 0 0 0', color:'#888', fontSize:'0.9rem'}}>
            Complete surveys to share your feedback on products you've tried.
          </p>
        </div>
        <div style={{
          background:'#eef2ff', color:'#4f46e5',
          padding:'6px 14px', borderRadius:'20px',
          fontWeight:'600', fontSize:'0.85rem'
        }}>
          {surveys.length} Survey{surveys.length !== 1 ? 's' : ''} Available
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      {surveys.length === 0 ? (
        <div style={{
          textAlign:'center', padding:'60px 20px',
          background:'#fafafa', borderRadius:'16px',
          border:'2px dashed #e5e7eb'
        }}>
          <div style={{fontSize:'3rem', marginBottom:'12px'}}>📭</div>
          <h3 style={{color:'#374151', marginBottom:'8px'}}>No Surveys Available Yet</h3>
          <p style={{color:'#9ca3af', fontSize:'0.9rem'}}>
            Check back later — companies will post surveys here for you to complete.<br/>
            Surveys may include Multiple Choice, Rating, and Text questions.
          </p>
        </div>
      ) : (
        <div className="surveys-grid">
          {surveys.map((survey) => (
            <div key={survey._id} className="survey-card" style={{
              border:'1.5px solid #e5e7eb', borderRadius:'14px',
              padding:'0', overflow:'hidden',
              transition:'box-shadow 0.2s ease',
              background:'#fff'
            }}>
              {survey.product?.image && (
                <img
                  src={survey.product.image}
                  alt={survey.product.name}
                  style={{width:'100%', height:'160px', objectFit:'cover'}}
                />
              )}
              <div style={{padding:'16px'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px'}}>
                  <h3 style={{margin:0, fontSize:'1.05rem', color:'#1e1e2e', fontWeight:'700'}}>
                    {survey.title}
                  </h3>
                  <span style={{
                    background:'#dcfce7', color:'#16a34a',
                    padding:'2px 10px', borderRadius:'20px',
                    fontSize:'0.72rem', fontWeight:'600', whiteSpace:'nowrap', marginLeft:'8px'
                  }}>
                    Active
                  </span>
                </div>
                <p style={{margin:'0 0 4px 0', fontSize:'0.82rem', color:'#6366f1', fontWeight:'600'}}>
                  🏢 {survey.company?.companyName}
                </p>
                <p style={{margin:'0 0 6px 0', fontSize:'0.82rem', color:'#555'}}>
                  📦 {survey.product?.name}
                </p>
                <p style={{margin:'0 0 10px 0', fontSize:'0.85rem', color:'#6b7280', lineHeight:'1.5'}}>
                  {survey.description || 'No description provided.'}
                </p>
                <div style={{
                  display:'flex', gap:'8px', flexWrap:'wrap',
                  padding:'8px 0', borderTop:'1px solid #f0f0f0',
                  marginBottom:'12px', fontSize:'0.78rem', color:'#666'
                }}>
                  <span>☑️ {survey.questions?.filter(q=>q.questionType==='mcq').length||0} MCQ</span>
                  <span>⭐ {survey.questions?.filter(q=>q.questionType==='rating').length||0} Rating</span>
                  <span>📝 {survey.questions?.filter(q=>q.questionType==='text').length||0} Text</span>
                  <span style={{marginLeft:'auto', fontWeight:'600', color:'#374151'}}>
                    {survey.questions?.length || 0} questions total
                  </span>
                </div>
                {ownCompany ? (
                  <p style={{
                    background:'#fff7ed', color:'#c2410c',
                    padding:'8px 12px', borderRadius:'8px',
                    fontSize:'0.82rem', margin:0
                  }}>
                    ⚠️ You cannot take your own company's survey.
                  </p>
                ) : hasApprovedSample ? (
                  <Link to={`/survey/${survey._id}`} style={{
                    display:'block', textAlign:'center',
                    padding:'10px', background:'#4f46e5', color:'#fff',
                    borderRadius:'8px', fontWeight:'600', fontSize:'0.9rem',
                    textDecoration:'none', transition:'background 0.2s'
                  }}>
                    Take Survey →
                  </Link>
                ) : (
                  <p style={{
                    background:'#f0f9ff', color:'#0369a1',
                    padding:'8px 12px', borderRadius:'8px',
                    fontSize:'0.82rem', margin:0
                  }}>
                    🔒 Request & get a sample approved first to unlock this survey.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
