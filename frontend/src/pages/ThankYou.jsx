import { Link, useLocation } from 'react-router-dom';

export default function ThankYou() {
  const location = useLocation();
  const surveyId = location.state?.surveyId;

  return (
    <div style={{
      minHeight:'80vh', display:'flex', alignItems:'center',
      justifyContent:'center', padding:'20px'
    }}>
      <div style={{
        background:'#fff', borderRadius:'20px',
        padding:'48px 40px', maxWidth:'500px', width:'100%',
        textAlign:'center', boxShadow:'0 8px 32px rgba(0,0,0,0.08)',
        border:'1px solid #e5e7eb'
      }}>
        <div style={{
          width:'80px', height:'80px', borderRadius:'50%',
          background:'linear-gradient(135deg, #4f46e5, #7c3aed)',
          display:'flex', alignItems:'center', justifyContent:'center',
          margin:'0 auto 24px auto', fontSize:'2.2rem'
        }}>
          🎉
        </div>

        <h1 style={{
          fontSize:'1.8rem', fontWeight:'800',
          color:'#1e1e2e', margin:'0 0 12px 0'
        }}>
          Thank You!
        </h1>

        <p style={{
          color:'#6b7280', fontSize:'1rem',
          lineHeight:'1.7', margin:'0 0 24px 0'
        }}>
          Your survey response has been <strong>recorded successfully</strong>.<br/>
          The company will use your feedback to improve their products.
        </p>

        <div style={{
          background:'#f8fafc', borderRadius:'12px',
          padding:'16px', marginBottom:'28px',
          border:'1px solid #e5e7eb'
        }}>
          <p style={{margin:0, fontSize:'0.85rem', color:'#555', lineHeight:'1.8'}}>
            ✅ Your answers have been saved<br/>
            📊 Your rating has been counted<br/>
            💬 Your text feedback has been recorded
          </p>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
          {surveyId && (
            <Link
              to={`/response/${surveyId}`}
              style={{
                display:'block', padding:'12px 24px',
                background:'#4f46e5', color:'#fff',
                borderRadius:'10px', fontWeight:'600',
                textDecoration:'none', fontSize:'0.95rem',
                transition:'background 0.2s'
              }}
            >
              📄 View My Response
            </Link>
          )}
          <Link
            to="/surveys"
            style={{
              display:'block', padding:'12px 24px',
              background:'#f3f4f6', color:'#374151',
              borderRadius:'10px', fontWeight:'600',
              textDecoration:'none', fontSize:'0.95rem'
            }}
          >
            🔍 Browse More Surveys
          </Link>
          <Link
            to="/dashboard"
            style={{
              display:'block', padding:'10px 24px',
              color:'#9ca3af', fontWeight:'500',
              textDecoration:'none', fontSize:'0.88rem'
            }}
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
