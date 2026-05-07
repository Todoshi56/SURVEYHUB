import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ReportButton from '../components/ReportButton';
import SearchWithHistory from '../components/SearchWithHistory';
import useSearchHistory from '../hooks/useSearchHistory';

export default function SurveysBrowse() {
  const { user } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [approvedProductIds, setApprovedProductIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const surveySearchKey = 'surveyhub_survey_search_history';
  const {
    history: searchHistory,
    saveSearch: saveSurveySearch,
    clearHistory: clearSurveySearchHistory,
  } = useSearchHistory(surveySearchKey);

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
  }, [user]);

  const filteredSurveys = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return surveys;
    return surveys.filter((survey) => {
      const surveyText = `${survey.title || ''} ${survey.company?.companyName || ''} ${survey.product?.name || ''} ${survey.description || ''}`.toLowerCase();
      return surveyText.includes(query);
    });
  }, [surveys, search]);

  const handleSurveySearch = (e) => {
    e.preventDefault();
    saveSurveySearch(search);
  };

  const handleSelectSurveySearch = (value) => {
    setSearch(value);
    saveSurveySearch(value);
  };

  const isOwnCompanySurvey = (survey) => {
    if (user?.role !== 'company' || !user?.companyId) return false;
    const surveyCompanyId = survey.company?._id || survey.company;
    return surveyCompanyId && String(surveyCompanyId) === String(user.companyId);
  };

  if (loading) return <div className="container"><p>Loading surveys...</p></div>;

  return (
    <div className="container">
      <h1>Available Surveys</h1>
      <SearchWithHistory
        value={search}
        onChange={setSearch}
        onSubmit={handleSurveySearch}
        placeholder="Search surveys by title, company, product, or description"
        history={searchHistory}
        onSelectHistory={handleSelectSurveySearch}
        onClearHistory={clearSurveySearchHistory}
        onClearSearch={() => setSearch('')}
        title="Recent survey searches"
      />

      {error && <p className="error">{error}</p>}
      {filteredSurveys.length === 0 ? (
        <p>No surveys available at the moment.</p>
      ) : (
        <div className="surveys-grid">
          {filteredSurveys.map((survey) => {
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
                <div className="card-actions">
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
                  {!ownCompany && (
                    <ReportButton
                      targetUserId={survey.company?.user}
                      targetLabel={`company "${survey.company?.companyName || 'Unknown'}"`}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
