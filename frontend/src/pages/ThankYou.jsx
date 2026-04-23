import { Link, useLocation } from 'react-router-dom';

export default function ThankYou() {
  const location = useLocation();
  const surveyId = location.state?.surveyId;

  return (
    <div className="container thank-you-page">
      <div className="thank-you-card">
        <div className="thank-you-icon">✓</div>
        <h1>Thank You!</h1>
        <p className="thank-you-message">
          Your survey response has been submitted successfully. We appreciate your feedback!
        </p>

        <div className="thank-you-actions">
          {surveyId && (
            <Link to={`/response/${surveyId}`} className="btn btn-primary">
              View Your Response
            </Link>
          )}
          <Link to="/surveys" className="btn btn-secondary">
            Back to Surveys
          </Link>
        </div>
      </div>
    </div>
  );
}
