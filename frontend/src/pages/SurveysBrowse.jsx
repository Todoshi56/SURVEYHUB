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
      <h1>Available Surveys</h1>
      {error && <p className="error">{error}</p>}
      {surveys.length === 0 ? (
        <p>No surveys available at the moment.</p>
      ) : (
        <div className="surveys-grid">
          {surveys.map((survey) => (
            <div key={survey._id} className="survey-card">
              <h3>{survey.title}</h3>
              <p className="company-name">{survey.company?.companyName}</p>
              <p className="product-name">Product: {survey.product?.name}</p>
              <p className="description">{survey.description || 'No description'}</p>
              <p className="questions-count">{survey.questions?.length} questions</p>
              <Link to={`/survey/${survey._id}`} className="btn btn-primary">
                Take Survey
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
