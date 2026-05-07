import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function SurveysBrowse() {
  const { user } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [approvedProductIds, setApprovedProductIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const surveysReq = axios.get('/api/surveys/browse/active');
        const myRequestsReq = user?.token
          ? axios.get('/api/sample-requests/mine', {
              headers: { Authorization: `Bearer ${user.token}` }
            })
          : Promise.resolve({ data: [] });
        const [surveysRes, requestsRes] = await Promise.all([surveysReq, myRequestsReq]);
        setSurveys(surveysRes.data);
        setApprovedProductIds(
          new Set(
            requestsRes.data
              .filter((r) => r.status === 'approved' && r.product?._id)
              .map((r) => r.product._id)
          )
        );
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load surveys');
        setSurveys([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const isOwnCompanySurvey = (survey) => {
    if (user?.role !== 'company' || !user?.companyId) return false;
    const surveyCompanyId = survey.company?._id || survey.company;
    return surveyCompanyId && String(surveyCompanyId) === String(user.companyId);
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
          {surveys.map((survey) => {
            const ownCompany = isOwnCompanySurvey(survey);
            const productId = survey.product?._id || survey.product;
            const hasApprovedSample = productId && approvedProductIds.has(productId);
            return (
              <div key={survey._id} className="survey-card">
                {survey.product?.image && (
                  <img
                    src={survey.product.image}
                    alt={survey.product.name}
                    className="survey-card-image"
                  />
                )}
                <h3>{survey.title}</h3>
                <p className="company-name">{survey.company?.companyName}</p>
                <p className="product-name">Product: {survey.product?.name}</p>
                <p className="description">{survey.description || 'No description'}</p>
                <p className="questions-count">{survey.questions?.length} questions</p>
                {ownCompany ? (
                  <p className="field-hint">
                    You can't take this survey — it belongs to your own company.
                  </p>
                ) : hasApprovedSample ? (
                  <Link to={`/survey/${survey._id}`} className="btn btn-primary">
                    Take Survey
                  </Link>
                ) : (
                  <p className="field-hint">
                    Request a sample of this product first — once the company approves, you can take the survey.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
