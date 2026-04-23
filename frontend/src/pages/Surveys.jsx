import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Surveys = () => {
  const [surveys, setSurveys] = useState([]);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const fetchSurveys = async () => {
    try {
      const { data } = await axios.get('/api/surveys', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setSurveys(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load surveys.');
    }
  };

  useEffect(() => { fetchSurveys(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this survey?')) return;
    try {
      await axios.delete(`/api/surveys/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchSurveys();
    } catch (err) {
      setError('Failed to delete survey.');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Surveys</h2>
        <Link to="/company/surveys/create" className="btn btn-primary">+ Create Survey</Link>
      </div>
      {error && <div className="alert alert-error">{error}</div>}

      {surveys.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No Surveys Yet</h3>
          <p>Create your first survey to start collecting customer feedback.</p>
          <Link to="/company/surveys/create" className="btn btn-primary">Create Survey</Link>
        </div>
      ) : (
        <div className="survey-list">
          {surveys.map((s) => (
            <div key={s._id} className="survey-card">
              <div className="survey-card-header">
                <h3>{s.title}</h3>
                <span className={`badge ${s.isActive ? 'badge-active' : 'badge-inactive'}`}>
                  {s.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="survey-product">Product: {s.product?.name || 'N/A'}</p>
              {s.description && <p className="survey-desc">{s.description}</p>}
              <p className="survey-questions">{s.questions?.length || 0} question(s)</p>
              <div className="survey-actions">
                <Link to={`/company/surveys/edit/${s._id}`} className="btn btn-sm btn-secondary">Edit</Link>
                <button onClick={() => handleDelete(s._id)} className="btn btn-sm btn-danger">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Surveys;
